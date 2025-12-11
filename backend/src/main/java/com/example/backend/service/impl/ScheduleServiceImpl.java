package com.example.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.dto.PatientSelectDTO;
import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.schedule.CreateScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.InsertTemplateEventDTO;
import com.example.backend.model.dto.schedule.ScheduleEventDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateWeeksDTO;
import com.example.backend.model.dto.schedule.TemplateEventDTO;
import com.example.backend.model.dto.schedule.WeekWithEventsDTO;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Authorization;
import com.example.backend.model.entity.CheckEvent;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.ScheduleEvent;
import com.example.backend.model.entity.ScheduleTemplate;
import com.example.backend.model.entity.ScheduleTemplateEvent;
import com.example.backend.model.entity.ScheduleTemplateWeek;
import com.example.backend.model.entity.Staff;
import com.example.backend.model.enums.CheckEventType;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.AuthorizationRepository;
import com.example.backend.repository.CheckEventRepository;
import com.example.backend.repository.PatientProgramRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.ScheduleEventRepository;
import com.example.backend.repository.ScheduleTemplateEventRepository;
import com.example.backend.repository.ScheduleTemplateRepository;
import com.example.backend.repository.ScheduleTemplateWeekRepository;
import com.example.backend.repository.ServiceDeliveryRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.service.ScheduleService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleTemplateRepository templateRepository;
    private final ScheduleTemplateWeekRepository weekRepository;
    private final ScheduleTemplateEventRepository eventRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final CheckEventRepository checkEventRepository;
    private final PatientProgramRepository patientProgramRepository;
    private final PatientRepository patientRepository;
    private final AppUserRepository appUserRepository;
    private final AuthorizationRepository authorizationRepository;
    private final ServiceDeliveryRepository serviceDeliveryRepository;
    private final com.example.backend.repository.DailyNoteRepository dailyNoteRepository;
    private final StaffRepository staffRepository;

    @Override
    @Transactional
    public ScheduleTemplateDTO createTemplate(UUID patientId, CreateScheduleTemplateDTO dto, String authenticatedUserEmail) {
        // Find patient and get office
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        Office office = patient.getOffice();
        
        // Check if active template already exists
        if (templateRepository.findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active").isPresent()) {
            throw new ConflictException("Patient already has an active schedule template");
        }
        
        // Get authenticated user for createdBy
        AppUser createdBy = appUserRepository.findByEmail(authenticatedUserEmail)
                .orElse(null); // Optional, allow null
        
        // Create template
        ScheduleTemplate template = new ScheduleTemplate();
        template.setOffice(office);
        template.setPatient(patient);
        template.setName(dto.getName() != null ? dto.getName() : "Master Weekly");
        template.setDescription(dto.getDescription());
        template.setStatus("active");
        template.setCreatedBy(createdBy);
        
        ScheduleTemplate savedTemplate = templateRepository.save(template);
        
        // Auto-create Week 1
        ScheduleTemplateWeek week1 = new ScheduleTemplateWeek();
        week1.setTemplate(savedTemplate);
        week1.setWeekIndex(1);
        weekRepository.save(week1);
        
        log.info("Created schedule template ID: {} for patient ID: {}", savedTemplate.getId(), patientId);
        
        return toScheduleTemplateDTO(savedTemplate);
    }

    @Override
    @Transactional
    public ScheduleTemplateDTO addWeek(UUID patientId, Integer weekIndex) {
        // Find active template
        ScheduleTemplate template = templateRepository
                .findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active")
                .orElseThrow(() -> new ResourceNotFoundException("Active schedule template for patient", patientId));
        
        // Check if week already exists
        if (weekRepository.findByTemplate_IdAndWeekIndex(template.getId(), weekIndex).isPresent()) {
            throw new ConflictException("Week " + weekIndex + " already exists for this template");
        }
        
        // Create new week
        ScheduleTemplateWeek week = new ScheduleTemplateWeek();
        week.setTemplate(template);
        week.setWeekIndex(weekIndex);
        weekRepository.save(week);
        
        log.info("Added week {} to template ID: {} for patient ID: {}", weekIndex, template.getId(), patientId);
        
        return toScheduleTemplateDTO(template);
    }

    @Override
    @Transactional
    public void deleteWeek(UUID patientId, Integer weekIndex) {
        ScheduleTemplate template = templateRepository
                .findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active")
                .orElseThrow(() -> new ResourceNotFoundException("Active schedule template for patient", patientId));

        ScheduleTemplateWeek week = weekRepository
                .findByTemplate_IdAndWeekIndex(template.getId(), weekIndex)
                .orElseThrow(() -> new ResourceNotFoundException("Week " + weekIndex + " not found for this template", null));

        UUID weekId = week.getId();
        
        // Step 1: Batch delete all events for this week (single query)
        // This is much more efficient than relying on cascade delete
        eventRepository.deleteAllByWeekId(weekId);
        log.debug("Batch deleted all events for week ID: {}", weekId);
        
        // Step 2: Finally delete the week
        weekRepository.delete(week);

        log.info("Deleted week {} from template ID: {} for patient ID: {}", weekIndex, template.getId(), patientId);
    }

    @Override
    @Transactional
    public void deleteTemplate(UUID patientId) {
        ScheduleTemplate template = templateRepository
                .findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active")
                .orElseThrow(() -> new ResourceNotFoundException("Active schedule template for patient", patientId));

        UUID templateId = template.getId();
        
        // Step 1: Batch delete all events for this template (single query)
        // This is much more efficient than deleting one by one
        eventRepository.deleteAllByTemplateId(templateId);
        log.debug("Batch deleted all events for template ID: {}", templateId);
        
        // Step 2: Batch delete all weeks for this template (single query)
        // This is much more efficient than deleting one by one
        weekRepository.deleteAllByTemplateId(templateId);
        log.debug("Batch deleted all weeks for template ID: {}", templateId);
        
        // Step 3: Finally delete the template
        templateRepository.delete(template);

        log.info("Deleted schedule template ID: {} for patient ID: {}", templateId, patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleTemplateWeeksDTO getTemplateWithWeeks(UUID patientId) {
        ScheduleTemplate template = templateRepository
                .findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active")
                .orElse(null);
        if (template == null) {
            return null;
        }

        ScheduleTemplateDTO templateDTO = toScheduleTemplateDTO(template);

        List<WeekWithEventsDTO> weeks = weekRepository.findAllByTemplate_IdOrderByWeekIndexAsc(template.getId())
                .stream()
                .map(week -> {
                    WeekWithEventsDTO weekDTO = new WeekWithEventsDTO();
                    weekDTO.setWeekIndex(week.getWeekIndex());
                    List<TemplateEventDTO> events = eventRepository
                            .findAllByTemplateWeek_IdOrderByDayOfWeekAscStartTimeAsc(week.getId())
                            .stream()
                            .map(this::toTemplateEventDTO)
                            .collect(Collectors.toList());
                    weekDTO.setEvents(events);
                    return weekDTO;
                })
                .collect(Collectors.toList());

        ScheduleTemplateWeeksDTO result = new ScheduleTemplateWeeksDTO();
        result.setTemplate(templateDTO);
        result.setWeeks(weeks);
        return result;
    }

    @Override
    @Transactional
    public List<TemplateEventDTO> createTemplateEvent(UUID patientId, InsertTemplateEventDTO dto) {
        ScheduleTemplate template = templateRepository
                .findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active")
                .orElseThrow(() -> new ResourceNotFoundException("Active schedule template for patient", patientId));

        ScheduleTemplateWeek week = weekRepository
                .findByTemplate_IdAndWeekIndex(template.getId(), dto.getWeekIndex())
                .orElseGet(() -> {
                    ScheduleTemplateWeek w = new ScheduleTemplateWeek();
                    w.setTemplate(template);
                    w.setWeekIndex(dto.getWeekIndex());
                    return weekRepository.save(w);
                });

        // Validate & resolve shared references once
        Authorization auth = null;
        if (dto.getAuthorizationId() != null) {
            auth = authorizationRepository.findById(dto.getAuthorizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Authorization", dto.getAuthorizationId()));
            if (!auth.getPatient().getId().equals(patientId)) {
                throw new ConflictException("Authorization does not belong to this patient");
            }
        }
        Staff staff = null;
        if (dto.getStaffId() != null) {
            staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff", dto.getStaffId()));
        }

        // Create events for each weekday with overlap validation
        for (Short dow : dto.getWeekdays()) {
            // Check for overlapping events on the same weekday
            List<ScheduleTemplateEvent> overlapping = eventRepository.findOverlappingEvents(
                    week.getId(),
                    dow,
                    dto.getStartTime(),
                    dto.getEndTime()
            );
            if (!overlapping.isEmpty()) {
                throw new ConflictException(
                        String.format("Event overlaps with existing event(s) on %s at %s-%s",
                                getDayName(dow),
                                dto.getStartTime(),
                                dto.getEndTime())
                );
            }

            ScheduleTemplateEvent event = new ScheduleTemplateEvent();
            event.setTemplateWeek(week);
            event.setDayOfWeek(dow);
            event.setStartTime(dto.getStartTime());
            event.setEndTime(dto.getEndTime());
            if (auth != null) {
                event.setAuthorization(auth);
                if (dto.getEventCode() == null || dto.getEventCode().isBlank()) {
                    event.setEventCode(auth.getEventCode());
                }
            }
            if (dto.getEventCode() != null && !dto.getEventCode().isBlank()) {
                event.setEventCode(dto.getEventCode());
            }
            event.setPlannedUnits(dto.getPlannedUnits());
            if (staff != null) {
                event.setStaff(staff);
            }
            event.setComment(dto.getComment());
            eventRepository.save(event);
        }

        return getTemplateEventsForWeek(patientId, dto.getWeekIndex());
    }

    private List<TemplateEventDTO> getTemplateEventsForWeek(UUID patientId, Integer weekIndex) {
        ScheduleTemplate template = templateRepository
                .findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active")
                .orElse(null);
        if (template == null) {
            return List.of();
        }
        ScheduleTemplateWeek week = weekRepository
                .findByTemplate_IdAndWeekIndex(template.getId(), weekIndex)
                .orElse(null);
        if (week == null) {
            return List.of();
        }
        return eventRepository
                .findAllByTemplateWeek_IdOrderByDayOfWeekAscStartTimeAsc(week.getId())
                .stream()
                .map(this::toTemplateEventDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TemplateEventDTO updateTemplateEvent(UUID patientId, UUID eventId, 
            com.example.backend.model.dto.schedule.UpdateTemplateEventDTO dto) {
        log.info("Updating template event: {}", eventId);

        // Fetch existing event
        ScheduleTemplateEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleTemplateEvent", eventId));

        // Validate patient ownership
        if (!event.getTemplateWeek().getTemplate().getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Event does not belong to this patient");
        }

        // Validate and resolve authorization if changed
        if (dto.getAuthorizationId() != null) {
            Authorization auth = authorizationRepository.findById(dto.getAuthorizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Authorization", dto.getAuthorizationId()));
            if (!auth.getPatient().getId().equals(patientId)) {
                throw new ConflictException("Authorization does not belong to this patient");
            }
            event.setAuthorization(auth);
            // Auto-fill event code from authorization if not explicitly provided
            if ((dto.getEventCode() == null || dto.getEventCode().isBlank()) && auth.getEventCode() != null) {
                event.setEventCode(auth.getEventCode());
            }
        }

        // Validate and resolve staff if changed
        if (dto.getStaffId() != null) {
            Staff staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff", dto.getStaffId()));
            event.setStaff(staff);
        }

        // Determine the day of week and times to check for overlaps
        Short dayOfWeek = dto.getDayOfWeek() != null ? dto.getDayOfWeek() : event.getDayOfWeek();
        java.time.LocalTime startTime = dto.getStartTime() != null ? dto.getStartTime() : event.getStartTime();
        java.time.LocalTime endTime = dto.getEndTime() != null ? dto.getEndTime() : event.getEndTime();

        // Validate time range
        if (endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new ConflictException("End time must be after start time");
        }

        // Check for overlapping events, excluding the current event
        List<ScheduleTemplateEvent> overlapping = eventRepository.findOverlappingEventsExcludingCurrent(
                event.getTemplateWeek().getId(),
                dayOfWeek,
                startTime,
                endTime,
                eventId
        );
        if (!overlapping.isEmpty()) {
            throw new ConflictException(
                    String.format("Event overlaps with existing event(s) on %s at %s-%s",
                            getDayName(dayOfWeek),
                            startTime,
                            endTime)
            );
        }

        // Update fields (partial update - only non-null values)
        if (dto.getDayOfWeek() != null) {
            event.setDayOfWeek(dto.getDayOfWeek());
        }
        if (dto.getStartTime() != null) {
            event.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            event.setEndTime(dto.getEndTime());
        }
        if (dto.getEventCode() != null) {
            event.setEventCode(dto.getEventCode());
        }
        if (dto.getPlannedUnits() != null) {
            event.setPlannedUnits(dto.getPlannedUnits());
        }
        if (dto.getComment() != null) {
            event.setComment(dto.getComment());
        }

        eventRepository.save(event);
        return toTemplateEventDTO(event);
    }

    @Override
    @Transactional
    public List<TemplateEventDTO> deleteTemplateEvent(UUID patientId, UUID eventId) {
        ScheduleTemplateEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleTemplateEvent", eventId));
        Integer weekIndex = event.getTemplateWeek().getWeekIndex();
        if (!event.getTemplateWeek().getTemplate().getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Event does not belong to this patient");
        }
        eventRepository.delete(event);
        return getTemplateEventsForWeek(patientId, weekIndex);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleEventDTO> getScheduleEvents(UUID patientId, LocalDate from, LocalDate to, String status) {
        List<ScheduleEvent> events = scheduleEventRepository
                .findAllByPatient_IdAndEventDateBetweenOrderByEventDateAscStartAtAsc(patientId, from, to);

        return events.stream()
                .filter(se -> status == null || (se.getStatus() != null && se.getStatus().name().equalsIgnoreCase(status)))
                .map(this::toScheduleEventDTO)
                .sorted(Comparator
                        .comparing(ScheduleEventDTO::getEventDate)
                        .thenComparing(ScheduleEventDTO::getStartAt))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleEventDTO> getScheduleEvents(
            UUID patientId,
            LocalDate from,
            LocalDate to,
            String status,
            UUID staffId,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        // Whitelist of allowed sort fields
        Set<String> allowedSortFields = Set.of(
                "eventDate", "startAt", "endAt", "status", "plannedUnits", "actualUnits"
        );
        
        // Validate sortBy
        if (sortBy != null && !sortBy.isEmpty() && !allowedSortFields.contains(sortBy)) {
            log.warn("Invalid sort field requested: {}", sortBy);
            sortBy = "eventDate"; // Default to eventDate
        }
        
        // Create pageable
        Pageable pageable;
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = 
                    "desc".equalsIgnoreCase(sortDir) 
                            ? Sort.Direction.DESC 
                            : Sort.Direction.ASC;
            Sort sort = Sort.by(direction, sortBy);
            pageable = PageRequest.of(page, size, sort);
        } else {
            // Default sorting by eventDate ASC, startAt ASC
            Sort defaultSort = Sort.by(
                    Sort.Direction.ASC, "eventDate", "startAt"
            );
            pageable = PageRequest.of(page, size, defaultSort);
        }
        
        // Normalize search term
        String normalizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        // Query events with pagination and search
        Page<ScheduleEvent> eventsPage;
        if (normalizedSearch != null) {
            // Use search-enabled query
            eventsPage = scheduleEventRepository.findAllByPatientIdWithSearch(
                    patientId, from, to, staffId, normalizedSearch, pageable
            );
        } else {
            // Use simple query without search
            if (staffId != null) {
                eventsPage = scheduleEventRepository.findAllByPatient_IdAndStaff_IdAndEventDateBetween(
                        patientId, staffId, from, to, pageable
                );
            } else {
                eventsPage = scheduleEventRepository.findAllByPatient_IdAndEventDateBetween(
                        patientId, from, to, pageable
                );
            }
        }
        
        // Filter by status if provided
        List<ScheduleEventDTO> filteredContent = eventsPage.getContent().stream()
                .filter(se -> status == null || (se.getStatus() != null && se.getStatus().name().equalsIgnoreCase(status)))
                .map(this::toScheduleEventDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(
                filteredContent,
                pageable,
                eventsPage.getTotalElements()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleEventDTO> getScheduleEventsByStaff(
            UUID staffId,
            LocalDate from,
            LocalDate to,
            String status,
            UUID patientId,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        // Whitelist of allowed sort fields
        Set<String> allowedSortFields = Set.of(
                "eventDate", "startAt", "endAt", "status", "plannedUnits", "actualUnits"
        );
        
        // Validate sortBy
        if (sortBy != null && !sortBy.isEmpty() && !allowedSortFields.contains(sortBy)) {
            log.warn("Invalid sort field requested: {}", sortBy);
            sortBy = "eventDate"; // Default to eventDate
        }
        
        // Create pageable
        Pageable pageable;
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = 
                    "desc".equalsIgnoreCase(sortDir) 
                            ? Sort.Direction.DESC 
                            : Sort.Direction.ASC;
            Sort sort = Sort.by(direction, sortBy);
            pageable = PageRequest.of(page, size, sort);
        } else {
            // Default sorting by eventDate ASC, startAt ASC
            Sort defaultSort = Sort.by(
                    Sort.Direction.ASC, "eventDate", "startAt"
            );
            pageable = PageRequest.of(page, size, defaultSort);
        }
        
        // Normalize search term
        String normalizedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        
        // Query events with pagination and search
        Page<ScheduleEvent> eventsPage;
        if (normalizedSearch != null) {
            // Use search-enabled query
            eventsPage = scheduleEventRepository.findAllByStaffIdWithSearch(
                    staffId, from, to, patientId, normalizedSearch, pageable
            );
        } else {
            // Use simple query without search
            if (patientId != null) {
                eventsPage = scheduleEventRepository.findAllByStaff_IdAndPatient_IdAndEventDateBetween(
                        staffId, patientId, from, to, pageable
                );
            } else {
                eventsPage = scheduleEventRepository.findAllByStaff_IdAndEventDateBetween(
                        staffId, from, to, pageable
                );
            }
        }
        
        // Filter by status if provided
        List<ScheduleEventDTO> filteredContent = eventsPage.getContent().stream()
                .filter(se -> status == null || (se.getStatus() != null && se.getStatus().name().equalsIgnoreCase(status)))
                .map(this::toScheduleEventDTO)
                .collect(Collectors.toList());
        
        return new PageImpl<>(
                filteredContent,
                pageable,
                eventsPage.getTotalElements()
        );
    }

    private TemplateEventDTO toTemplateEventDTO(ScheduleTemplateEvent e) {
        TemplateEventDTO dto = new TemplateEventDTO();
        dto.setId(e.getId());
        dto.setTemplateWeekId(e.getTemplateWeek().getId());
        dto.setDayOfWeek(e.getDayOfWeek());
        dto.setStartTime(e.getStartTime());
        dto.setEndTime(e.getEndTime());
        dto.setEventCode(e.getEventCode());
        dto.setPlannedUnits(e.getPlannedUnits());
        if (e.getAuthorization() != null) {
            dto.setAuthorizationId(e.getAuthorization().getId());
            if (e.getAuthorization().getPatientService() != null && e.getAuthorization().getPatientService().getServiceType() != null) {
                dto.setServiceCode(e.getAuthorization().getPatientService().getServiceType().getCode());
                dto.setServiceName(e.getAuthorization().getPatientService().getServiceType().getName());
            }
            dto.setBillType(e.getAuthorization().getFormat());
        }
        if (e.getStaff() != null) {
            dto.setStaffId(e.getStaff().getId());
            String staffName = (e.getStaff().getLastName() != null ? e.getStaff().getLastName() : "") + ", " + (e.getStaff().getFirstName() != null ? e.getStaff().getFirstName() : "");
            dto.setStaffName(staffName.trim().replaceAll(", $", ""));
        }
        dto.setComment(e.getComment());
        return dto;
    }

    @Override
    @Transactional
    public int generateFromTemplate(UUID patientId, LocalDate endDate) {
        ScheduleTemplate template = templateRepository
                .findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(patientId, "active")
                .orElseThrow(() -> new ResourceNotFoundException("Active schedule template for patient", patientId));

        LocalDate startDate = template.getGeneratedThrough() != null
                ? template.getGeneratedThrough().plusDays(1)
                : LocalDate.now();
        if (startDate.isAfter(endDate)) {
            return 0;
        }

        // Load and order weeks
        List<ScheduleTemplateWeek> weeks = weekRepository.findAllByTemplate_IdOrderByWeekIndexAsc(template.getId());
        if (weeks.isEmpty()) {
            return 0;
        }

        // Preload events per week
        record WeekBundle(ScheduleTemplateWeek week, List<ScheduleTemplateEvent> events) {}
        List<WeekBundle> weekBundles = weeks.stream()
                .map(w -> new WeekBundle(w, eventRepository.findAllByTemplateWeek_IdOrderByDayOfWeekAscStartTimeAsc(w.getId())))
                .toList();

        long days = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        int created = 0;

        for (int i = 0; i < days; i++) {
            LocalDate current = startDate.plusDays(i);
            long weeksBetween = ChronoUnit.WEEKS.between(startDate, current);
            int idx = (int) (weeksBetween % weekBundles.size());
            WeekBundle bundle = weekBundles.get(idx);

            int dowZeroSunday = current.getDayOfWeek().getValue() % 7; // 0=Sun..6=Sat
            for (ScheduleTemplateEvent te : bundle.events) {
                if (te.getDayOfWeek() == dowZeroSunday) {
                    LocalTime st = te.getStartTime();
                    LocalTime et = te.getEndTime();
                    OffsetDateTime startAt = OffsetDateTime.of(current, st, ZoneOffset.UTC);
                    OffsetDateTime endAt = OffsetDateTime.of(current, et, ZoneOffset.UTC);

                    if (scheduleEventRepository.existsByPatient_IdAndEventDateAndStartAt(patientId, current, startAt)) {
                        continue;
                    }

                    ScheduleEvent se = new ScheduleEvent();
                    se.setOffice(template.getOffice());
                    se.setPatient(template.getPatient());
                    se.setEventDate(current);
                    se.setStartAt(startAt);
                    se.setEndAt(endAt);
                    se.setAuthorization(te.getAuthorization());
                    se.setStaff(te.getStaff());
                    se.setEventCode(te.getEventCode());
                    se.setStatus(com.example.backend.model.enums.ScheduleEventStatus.PLANNED);
                    se.setPlannedUnits(te.getPlannedUnits());
                    se.setSourceTemplate(template);
                    se.setGeneratedAt(now);
                    scheduleEventRepository.save(se);
                    created++;
                }
            }
        }

        if (created > 0) {
            template.setGeneratedThrough(endDate);
            templateRepository.save(template);
        }

        return created;
    }

    private ScheduleEventDTO toScheduleEventDTO(ScheduleEvent e) {
        ScheduleEventDTO dto = new ScheduleEventDTO();
        dto.setId(e.getId());
        dto.setPatientId(e.getPatient() != null ? e.getPatient().getId() : null);
        // Patient name for display in staff context
        if (e.getPatient() != null) {
            String patientName = (e.getPatient().getLastName() != null ? e.getPatient().getLastName() : "") + ", " + (e.getPatient().getFirstName() != null ? e.getPatient().getFirstName() : "");
            dto.setPatientName(patientName.trim().replaceAll(", $", ""));
            dto.setPatientClientId(e.getPatient().getClientId());
            
            // Supervisor mapping (patient's supervisor)
            if (e.getPatient().getSupervisor() != null) {
                dto.setSupervisorId(e.getPatient().getSupervisor().getId());
                String supervisorName = (e.getPatient().getSupervisor().getLastName() != null ? e.getPatient().getSupervisor().getLastName() : "") + ", " + (e.getPatient().getSupervisor().getFirstName() != null ? e.getPatient().getSupervisor().getFirstName() : "");
                dto.setSupervisorName(supervisorName.trim().replaceAll(", $", ""));
            }
        }
        dto.setEventDate(e.getEventDate());
        dto.setStartAt(e.getStartAt());
        dto.setEndAt(e.getEndAt());
        dto.setStatus(e.getStatus() != null ? e.getStatus().name() : null);
        dto.setPlannedUnits(e.getPlannedUnits());
        // Program identifier via PatientProgram -> Program
        try {
            if (e.getPatient() != null) {
                patientProgramRepository.findByPatientId(e.getPatient().getId())
                        .map(pp -> pp.getProgram() != null ? pp.getProgram().getProgramIdentifier() : null)
                        .ifPresent(dto::setProgramIdentifier);
            }
        } catch (Exception ex) {
            log.debug("Program lookup failed for event {}: {}", e.getId(), ex.getMessage());
        }
        // Employee (staff) mapping
        if (e.getStaff() != null) {
            dto.setEmployeeId(e.getStaff().getId());
            String staffName = (e.getStaff().getLastName() != null ? e.getStaff().getLastName() : "") + ", " + (e.getStaff().getFirstName() != null ? e.getStaff().getFirstName() : "");
            dto.setEmployeeName(staffName.trim().replaceAll(", $", ""));
        }
        // Authorization mapping
        if (e.getAuthorization() != null) {
            dto.setAuthorizationId(e.getAuthorization().getId());
            if (e.getAuthorization().getPatientService() != null && e.getAuthorization().getPatientService().getServiceType() != null) {
                dto.setServiceCode(e.getAuthorization().getPatientService().getServiceType().getCode());
            }
        }
        dto.setEventCode(e.getEventCode());
        if (e.getActualUnits() != null) {
            dto.setActualUnits(e.getActualUnits().doubleValue());
        }

        // Actual times - map from CheckEvent (check in/out) or ServiceDelivery
        // For now, use checkInTime/checkOutTime which are already mapped below
        
        // CALL IN/OUT from CheckEvent
        checkEventRepository.findFirstByScheduleEvent_IdAndEventTypeOrderByOccurredAtAsc(e.getId(), CheckEventType.CHECK_IN)
                .map(CheckEvent::getOccurredAt)
                .ifPresent(t -> {
                    OffsetDateTime checkIn = t.atOffset(e.getStartAt() != null ? e.getStartAt().getOffset() : java.time.ZoneOffset.UTC);
                    dto.setCheckInTime(checkIn);
                    // Also set actualStartAt if check-in exists
                    dto.setActualStartAt(checkIn);
                });
        checkEventRepository.findFirstByScheduleEvent_IdAndEventTypeOrderByOccurredAtDesc(e.getId(), CheckEventType.CHECK_OUT)
                .map(CheckEvent::getOccurredAt)
                .ifPresent(t -> {
                    OffsetDateTime checkOut = t.atOffset(e.getEndAt() != null ? e.getEndAt().getOffset() : java.time.ZoneOffset.UTC);
                    dto.setCheckOutTime(checkOut);
                    // Also set actualEndAt if check-out exists
                    dto.setActualEndAt(checkOut);
                });
        
        // Service Delivery mapping (get latest active service delivery for this schedule event)
        serviceDeliveryRepository.findFirstByScheduleEvent_IdOrderByCreatedAtDesc(e.getId())
                .ifPresent(sd -> {
                    dto.setServiceDeliveryId(sd.getId());
                    dto.setServiceDeliveryStatus(sd.getStatus() != null ? sd.getStatus() : null);
                    
                    // Check if Daily Note exists for this Service Delivery
                    dailyNoteRepository.findFirstByServiceDelivery_IdOrderByCreatedAtDesc(sd.getId())
                            .ifPresent(dn -> dto.setDailyNoteId(dn.getId()));
                });
        
        // Set comment from entity
        dto.setComments(e.getComment());
        
        return dto;
    }

    private String getDayName(Short dayOfWeek) {
        return switch (dayOfWeek) {
            case 0 -> "Sunday";
            case 1 -> "Monday";
            case 2 -> "Tuesday";
            case 3 -> "Wednesday";
            case 4 -> "Thursday";
            case 5 -> "Friday";
            case 6 -> "Saturday";
            default -> "Unknown";
        };
    }

    private ScheduleTemplateDTO toScheduleTemplateDTO(ScheduleTemplate template) {
        ScheduleTemplateDTO dto = new ScheduleTemplateDTO();
        dto.setId(template.getId());
        dto.setPatientId(template.getPatient() != null ? template.getPatient().getId() : null);
        dto.setOfficeId(template.getOffice() != null ? template.getOffice().getId() : null);
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setStatus(template.getStatus());
        dto.setCreatedAt(template.getCreatedAt());
        dto.setUpdatedAt(template.getUpdatedAt());
        dto.setGeneratedThrough(template.getGeneratedThrough());
        // generatedThrough could be calculated from latest ScheduleEvent generated_at if needed
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffSelectDTO> getRelatedStaffForPatient(UUID patientId) {
        // Verify patient exists
        patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        // Get distinct staff IDs from schedule events
        List<UUID> staffIds = scheduleEventRepository.findDistinctStaffIdsByPatientId(patientId);

        if (staffIds.isEmpty()) {
            return List.of();
        }

        // Fetch staff entities and convert to DTOs
        return staffRepository.findAllById(staffIds).stream()
                .filter(staff -> staff.isActiveStaff())
                .map(staff -> {
                    String fullName = (staff.getLastName() != null ? staff.getLastName() : "") + ", " + 
                                     (staff.getFirstName() != null ? staff.getFirstName() : "");
                    fullName = fullName.trim().replaceAll(", $", "");
                    
                    String displayName = fullName;
                    if (staff.getEmployeeId() != null && !staff.getEmployeeId().isEmpty()) {
                        displayName += " (" + staff.getEmployeeId() + ")";
                    }
                    if (staff.getOffice() != null && staff.getOffice().getName() != null) {
                        displayName += " - " + staff.getOffice().getName();
                    }
                    
                    return StaffSelectDTO.builder()
                            .id(staff.getId())
                            .displayName(displayName)
                            .build();
                })
                .sorted((a, b) -> a.getDisplayName().compareToIgnoreCase(b.getDisplayName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientSelectDTO> getRelatedPatientsForStaff(UUID staffId) {
        // Verify staff exists
        staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", staffId));

        // Get distinct patient IDs from schedule events
        List<UUID> patientIds = scheduleEventRepository.findDistinctPatientIdsByStaffId(staffId);

        if (patientIds.isEmpty()) {
            return List.of();
        }

        // Fetch patient entities and convert to DTOs
        return patientRepository.findAllById(patientIds).stream()
                .filter(patient -> patient.getStatus() != null && patient.getStatus().name().equals("ACTIVE"))
                .map(patient -> {
                    String fullName = (patient.getLastName() != null ? patient.getLastName() : "") + ", " + 
                                     (patient.getFirstName() != null ? patient.getFirstName() : "");
                    fullName = fullName.trim().replaceAll(", $", "");
                    
                    String displayName = fullName;
                    if (patient.getMedicaidId() != null && !patient.getMedicaidId().isEmpty()) {
                        displayName += " (" + patient.getMedicaidId() + ")";
                    } else if (patient.getClientId() != null && !patient.getClientId().isEmpty()) {
                        displayName += " (" + patient.getClientId() + ")";
                    }
                    
                    return PatientSelectDTO.builder()
                            .id(patient.getId())
                            .displayName(displayName)
                            .firstName(patient.getFirstName())
                            .lastName(patient.getLastName())
                            .medicaidId(patient.getMedicaidId())
                            .clientId(patient.getClientId())
                            .build();
                })
                .sorted((a, b) -> a.getDisplayName().compareToIgnoreCase(b.getDisplayName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ScheduleEventDTO> getAllScheduleEvents(
            LocalDate from,
            LocalDate to,
            UUID patientId,
            UUID staffId,
            String status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    ) {
        log.info("Fetching all schedule events: from={}, to={}, patientId={}, staffId={}, status={}, page={}, size={}",
                from, to, patientId, staffId, status, page, size);

        Sort.Direction direction = 
            "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        
        Sort sort = sortBy != null && !sortBy.isEmpty() 
            ? Sort.by(direction, sortBy)
            : Sort.by(direction, "eventDate");

        Pageable pageable = PageRequest.of(page, size, sort);

        // Use repository to fetch with filters
        Page<ScheduleEvent> events;
        if (patientId != null && staffId != null) {
            events = scheduleEventRepository.findByDateRangeAndPatientAndStaffAndStatus(
                    from, to, patientId, staffId, status != null ? status : "", pageable);
        } else if (patientId != null) {
            events = scheduleEventRepository.findByDateRangeAndPatientAndStatus(
                    from, to, patientId, status != null ? status : "", pageable);
        } else if (staffId != null) {
            events = scheduleEventRepository.findByDateRangeAndStaffAndStatus(
                    from, to, staffId, status != null ? status : "", pageable);
        } else {
            events = scheduleEventRepository.findByDateRangeAndStatus(
                    from, to, status != null ? status : "", pageable);
        }

        return events.map(this::toScheduleEventDTO);
    }

    @Override
    @Transactional
    public com.example.backend.model.dto.schedule.CreateSchedulePreviewResponseDTO createSchedulePreview(
            com.example.backend.model.dto.schedule.CreateSchedulePreviewRequestDTO request,
            String authenticatedUserEmail
    ) {
        log.info("Creating schedule preview for patient: {}", request.getScheduleEvent().getPatientId());

        com.example.backend.model.dto.schedule.CreateSchedulePreviewResponseDTO response = 
            new com.example.backend.model.dto.schedule.CreateSchedulePreviewResponseDTO();

        // Generate events based on repeat config
        List<com.example.backend.model.dto.schedule.CreateScheduleEventDTO> eventsToCreate = 
            generateEventsFromRequest(request);

        // Convert to ScheduleEventDTO for preview (without saving)
        List<ScheduleEventDTO> previewEvents = eventsToCreate.stream()
                .map(this::toPreviewScheduleEventDTO)
                .collect(Collectors.toList());

        response.setScheduleEvents(previewEvents);

        // Detect conflicts
        List<com.example.backend.model.dto.schedule.ScheduleConflictDTO> conflicts = 
            detectConflictsForEvents(eventsToCreate);

        response.setConflicts(conflicts);
        response.setCanSave(conflicts.isEmpty() || conflicts.stream().allMatch(c -> c.isResolved()));

        if (previewEvents.size() == 1) {
            response.setMessage("1 event will be created");
        } else {
            response.setMessage(previewEvents.size() + " events will be created");
        }

        return response;
    }

    @Override
    @Transactional
    public List<ScheduleEventDTO> createScheduleEvents(
            List<com.example.backend.model.dto.schedule.CreateScheduleEventDTO> events,
            String authenticatedUserEmail
    ) {
        log.info("Creating {} schedule events", events.size());

        // Validate conflicts before saving
        List<com.example.backend.model.dto.schedule.ScheduleConflictDTO> conflicts = detectConflictsForEvents(events);
        if (!conflicts.isEmpty()) {
            // Check if any conflict is unresolved (though here all are unresolved effectively as we are creating new)
            // For batch creation, we strictly block any conflicts
            throw new ConflictException("Cannot create schedule events due to " + conflicts.size() + " conflicts. Please refresh and try again.");
        }

        // Get authenticated user
        AppUser createdBy = appUserRepository.findByEmail(authenticatedUserEmail)
                .orElse(null);

        List<ScheduleEvent> savedEvents = events.stream()
                .map(dto -> createScheduleEventFromDTO(dto, createdBy))
                .map(scheduleEventRepository::save)
                .collect(Collectors.toList());

        return savedEvents.stream()
                .map(this::toScheduleEventDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleEventDTO getScheduleEvent(UUID eventId, String authenticatedUserEmail) {
        log.info("Fetching schedule event: {}", eventId);

        // Get authenticated user
        AppUser user = appUserRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", authenticatedUserEmail));

        // Fetch event
        ScheduleEvent event = scheduleEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent", eventId));

        // Validate user has access to the event's office
        // User must be assigned to the office where the event is taking place
        boolean hasAccess = user.getUserOffices().stream()
                .anyMatch(uo -> uo.getOffice().getId().equals(event.getOffice().getId()));

        if (!hasAccess) {
            // Check if user is a system admin (optional fallback)
            boolean isAdmin = user.getRole().getName().equalsIgnoreCase("ADMIN") || 
                              user.getRole().getCode().equalsIgnoreCase("ADMIN");
            
            if (!isAdmin) {
                throw new com.example.backend.exception.UnauthorizedException(
                        "You do not have access to this schedule event");
            }
        }

        return toScheduleEventDTO(event);
    }

    @Override
    @Transactional
    public ScheduleEventDTO updateScheduleEvent(
            UUID eventId,
            com.example.backend.model.dto.schedule.UpdateScheduleEventDTO dto,
            String authenticatedUserEmail
    ) {
        log.info("Updating schedule event: {}", eventId);

        // Get authenticated user
        AppUser user = appUserRepository.findByEmail(authenticatedUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", authenticatedUserEmail));

        // Fetch existing event
        ScheduleEvent event = scheduleEventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduleEvent", eventId));

        // Validate user has access to the event's office
        boolean hasAccess = user.getUserOffices().stream()
                .anyMatch(uo -> uo.getOffice().getId().equals(event.getOffice().getId()));

        if (!hasAccess) {
            // Check if user is a system admin (optional fallback)
            boolean isAdmin = user.getRole().getName().equalsIgnoreCase("ADMIN") || 
                              user.getRole().getCode().equalsIgnoreCase("ADMIN");
            
            if (!isAdmin) {
                throw new com.example.backend.exception.UnauthorizedException(
                        "You do not have access to this schedule event");
            }
        }

        // Partial update - only update fields that are not null
        if (dto.getAuthorizationId() != null) {
            Authorization authorization = authorizationRepository.findById(dto.getAuthorizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Authorization", dto.getAuthorizationId()));
            event.setAuthorization(authorization);
        }

        if (dto.getEventDate() != null) {
            event.setEventDate(dto.getEventDate());
        }

        if (dto.getStartTime() != null && dto.getEndTime() != null) {
            LocalDate startDate = dto.getEventDate() != null ? dto.getEventDate() : event.getEventDate();
            LocalDate endDate = startDate;
            
            // Handle events spanning midnight
            if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
                endDate = startDate.plusDays(1);
            }
            
            event.setStartAt(startDate.atTime(dto.getStartTime()).atOffset(ZoneOffset.UTC));
            event.setEndAt(endDate.atTime(dto.getEndTime()).atOffset(ZoneOffset.UTC));
            event.setEventDate(startDate);
        }

        if (dto.getStaffId() != null) {
            if (dto.getStaffId().toString().equals("00000000-0000-0000-0000-000000000000")) {
                // Special UUID to indicate "remove staff"
                event.setStaff(null);
            } else {
                Staff staff = staffRepository.findById(dto.getStaffId())
                        .orElseThrow(() -> new ResourceNotFoundException("Staff", dto.getStaffId()));
                event.setStaff(staff);
            }
        }

        if (dto.getEventCode() != null) {
            event.setEventCode(dto.getEventCode());
        }

        if (dto.getStatus() != null) {
            event.setStatus(com.example.backend.model.enums.ScheduleEventStatus.valueOf(dto.getStatus()));
        }

        if (dto.getPlannedUnits() != null) {
            // Note: 1 unit = 15 minutes. When calculating units from time duration,
            // divide total minutes by 15 to get the number of units.
            event.setPlannedUnits(dto.getPlannedUnits());
        
        }

        // Note: actualUnits, actualStartAt, actualEndAt are read-only in the form
        // They should not be updated via the Edit form, but we include them in DTO for completeness
        // In a real system, these would be updated via a separate endpoint (e.g., when staff checks in/out)

        if (dto.getComments() != null) {
            event.setComment(dto.getComments());
        }

        // Validate: end_at must be after start_at
        if (event.getEndAt().isBefore(event.getStartAt()) || event.getEndAt().equals(event.getStartAt())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // Save updated event
        ScheduleEvent savedEvent = scheduleEventRepository.save(event);

        return toScheduleEventDTO(savedEvent);
    }

    // Helper methods

    private List<com.example.backend.model.dto.schedule.CreateScheduleEventDTO> generateEventsFromRequest(
            com.example.backend.model.dto.schedule.CreateSchedulePreviewRequestDTO request
    ) {
        List<com.example.backend.model.dto.schedule.CreateScheduleEventDTO> events = new ArrayList<>();
        com.example.backend.model.dto.schedule.CreateScheduleEventDTO baseEvent = request.getScheduleEvent();
        com.example.backend.model.dto.schedule.RepeatConfigDTO repeatConfig = request.getRepeatConfig();

        if (repeatConfig == null) {
            // Single event
            events.add(baseEvent);
            return events;
        }

        // Generate repeated events
        LocalDate currentDate = baseEvent.getEventDate();
        int occurrenceCount = 0;
        LocalDate endDate = repeatConfig.getEndDate();
        Integer maxOccurrences = repeatConfig.getOccurrences();

        while (true) {
            // Check end conditions
            if (endDate != null && currentDate.isAfter(endDate)) {
                break;
            }
            if (maxOccurrences != null && occurrenceCount >= maxOccurrences) {
                break;
            }

            // Check if current date matches repeat criteria
            boolean shouldCreateEvent = false;
            if ("WEEK".equalsIgnoreCase(repeatConfig.getFrequency())) {
                int dayOfWeek = currentDate.getDayOfWeek().getValue() % 7; // Convert to 0=Sun format
                if (repeatConfig.getDaysOfWeek() != null && repeatConfig.getDaysOfWeek().contains(dayOfWeek)) {
                    shouldCreateEvent = true;
                }
            } else {
                // Monthly repeat (simplified - same day of month)
                shouldCreateEvent = true;
            }

            if (shouldCreateEvent) {
                com.example.backend.model.dto.schedule.CreateScheduleEventDTO newEvent = 
                    new com.example.backend.model.dto.schedule.CreateScheduleEventDTO();
                newEvent.setPatientId(baseEvent.getPatientId());
                newEvent.setEventDate(currentDate);
                newEvent.setStartTime(baseEvent.getStartTime());
                newEvent.setEndTime(baseEvent.getEndTime());
                newEvent.setAuthorizationId(baseEvent.getAuthorizationId());
                newEvent.setStaffId(baseEvent.getStaffId());
                newEvent.setEventCode(baseEvent.getEventCode());
                newEvent.setStatus(baseEvent.getStatus());
                newEvent.setPlannedUnits(baseEvent.getPlannedUnits());
                newEvent.setComments(baseEvent.getComments());
                
                events.add(newEvent);
                occurrenceCount++;
            }

            // Advance date
            if ("WEEK".equalsIgnoreCase(repeatConfig.getFrequency())) {
                currentDate = currentDate.plusDays(1);
                // Skip to next week cycle if no days match in current week
                if (currentDate.getDayOfWeek().getValue() % 7 == 0 && occurrenceCount > 0) {
                    currentDate = currentDate.plusWeeks(repeatConfig.getInterval() - 1);
                }
            } else {
                currentDate = currentDate.plusMonths(repeatConfig.getInterval());
            }

            // Safety limit
            if (occurrenceCount > 365) {
                log.warn("Exceeded safety limit of 365 events");
                break;
            }
        }

        return events;
    }

    private List<com.example.backend.model.dto.schedule.ScheduleConflictDTO> detectConflictsForEvents(
            List<com.example.backend.model.dto.schedule.CreateScheduleEventDTO> events
    ) {
        List<com.example.backend.model.dto.schedule.ScheduleConflictDTO> conflicts = new ArrayList<>();

        for (com.example.backend.model.dto.schedule.CreateScheduleEventDTO event : events) {
            // Calculate absolute time range for the new event
            LocalDate startDate = event.getEventDate();
            LocalDate endDate = startDate;
            if (event.getEndTime().isBefore(event.getStartTime()) || event.getEndTime().equals(event.getStartTime())) {
                endDate = startDate.plusDays(1);
            }
            OffsetDateTime startAt = startDate.atTime(event.getStartTime()).atOffset(ZoneOffset.UTC);
            OffsetDateTime endAt = endDate.atTime(event.getEndTime()).atOffset(ZoneOffset.UTC);

            // Check patient conflicts
            // Fetch events from day before to day after to handle overlaps across midnight
            List<ScheduleEvent> patientEvents = scheduleEventRepository.findAllByPatient_IdAndEventDateBetweenOrderByEventDateAscStartAtAsc(
                    event.getPatientId(), startDate.minusDays(1), startDate.plusDays(1));

            for (ScheduleEvent existing : patientEvents) {
                if (hasTimeOverlap(startAt, endAt, existing.getStartAt(), existing.getEndAt())) {
                    
                    com.example.backend.model.dto.schedule.ScheduleConflictDTO conflict = 
                        new com.example.backend.model.dto.schedule.ScheduleConflictDTO();
                    conflict.setConflictType("PATIENT_CONFLICT");
                    conflict.setConflictingEventId(existing.getId());
                    conflict.setEventDate(event.getEventDate());
                    conflict.setStartTime(existing.getStartAt().toLocalTime());
                    conflict.setEndTime(existing.getEndAt().toLocalTime());
                    conflict.setMessage("Patient already has an event scheduled during this time");
                    conflict.setConflictingWithName(existing.getPatient().getFullName());
                    conflict.setResolved(false);
                    
                    conflicts.add(conflict);
                }
            }

            // Check staff conflicts if staff is assigned
            if (event.getStaffId() != null) {
                // Use pagination method with unpaged to get all
                Page<ScheduleEvent> staffEventsPage = scheduleEventRepository.findAllByStaff_IdAndEventDateBetween(
                        event.getStaffId(), startDate.minusDays(1), startDate.plusDays(1), Pageable.unpaged());
                List<ScheduleEvent> staffEvents = staffEventsPage.getContent();

                for (ScheduleEvent existing : staffEvents) {
                    if (hasTimeOverlap(startAt, endAt, existing.getStartAt(), existing.getEndAt())) {
                        
                        com.example.backend.model.dto.schedule.ScheduleConflictDTO conflict = 
                            new com.example.backend.model.dto.schedule.ScheduleConflictDTO();
                        conflict.setConflictType("STAFF_CONFLICT");
                        conflict.setConflictingEventId(existing.getId());
                        conflict.setEventDate(event.getEventDate());
                        conflict.setStartTime(existing.getStartAt().toLocalTime());
                        conflict.setEndTime(existing.getEndAt().toLocalTime());
                        conflict.setMessage("Employee already has an event scheduled during this time");
                        if (existing.getStaff() != null) {
                            conflict.setConflictingWithName(existing.getStaff().getLastName() + ", " + existing.getStaff().getFirstName());
                        }
                        conflict.setResolved(false);
                        
                        conflicts.add(conflict);
                    }
                }
            }
        }

        return conflicts;
    }

    private boolean hasTimeOverlap(OffsetDateTime start1, OffsetDateTime end1, OffsetDateTime start2, OffsetDateTime end2) {
        // Overlap if Start1 < End2 AND End1 > Start2
        return start1.isBefore(end2) && end1.isAfter(start2);
    }

    private ScheduleEventDTO toPreviewScheduleEventDTO(
            com.example.backend.model.dto.schedule.CreateScheduleEventDTO dto
    ) {
        ScheduleEventDTO preview = new ScheduleEventDTO();
        preview.setPatientId(dto.getPatientId());
        preview.setEventDate(dto.getEventDate());
        preview.setStartAt(dto.getEventDate().atTime(dto.getStartTime()).atOffset(ZoneOffset.UTC));
        preview.setEndAt(dto.getEventDate().atTime(dto.getEndTime()).atOffset(ZoneOffset.UTC));
        preview.setStatus(dto.getStatus());
        preview.setPlannedUnits(dto.getPlannedUnits());
        preview.setAuthorizationId(dto.getAuthorizationId());
        preview.setEmployeeId(dto.getStaffId());
        preview.setEventCode(dto.getEventCode());
        preview.setComments(dto.getComments());

        // Load additional info for display
        if (dto.getPatientId() != null) {
            patientRepository.findById(dto.getPatientId()).ifPresent(patient -> {
                preview.setPatientName(patient.getFullName());
                preview.setPatientClientId(patient.getClientId());
            });
        }

        if (dto.getStaffId() != null) {
            staffRepository.findById(dto.getStaffId()).ifPresent(staff -> {
                preview.setEmployeeName(staff.getLastName() + ", " + staff.getFirstName());
            });
        }

        if (dto.getAuthorizationId() != null) {
            authorizationRepository.findById(dto.getAuthorizationId()).ifPresent(auth -> {
                if (auth.getPatientService() != null && auth.getPatientService().getServiceType() != null) {
                    preview.setServiceCode(auth.getPatientService().getServiceType().getCode());
                }
            });
        }

        return preview;
    }

    private ScheduleEvent createScheduleEventFromDTO(
            com.example.backend.model.dto.schedule.CreateScheduleEventDTO dto,
            AppUser createdBy
    ) {
        // Fetch required entities
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

        Authorization authorization = authorizationRepository.findById(dto.getAuthorizationId())
                .orElseThrow(() -> new ResourceNotFoundException("Authorization", dto.getAuthorizationId()));

        Staff staff = null;
        if (dto.getStaffId() != null) {
            staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff", dto.getStaffId()));
        }

        // Create schedule event
        ScheduleEvent event = new ScheduleEvent();
        event.setOffice(patient.getOffice());
        event.setPatient(patient);
        
        // Handle start_at and end_at - if endTime is before startTime, end_at is on the next day
        LocalDate startDate = dto.getEventDate();
        LocalDate endDate = dto.getEventDate();
        
        // If end time is before start time, end date is next day (event spans midnight)
        if (dto.getEndTime().isBefore(dto.getStartTime()) || dto.getEndTime().equals(dto.getStartTime())) {
            endDate = startDate.plusDays(1);
        }
        
        // Set event_date to match the date of start_at (in local date, not UTC)
        // This ensures event_date always matches the calendar date when the event starts
        event.setEventDate(startDate);
        
        event.setStartAt(startDate.atTime(dto.getStartTime()).atOffset(ZoneOffset.UTC));
        event.setEndAt(endDate.atTime(dto.getEndTime()).atOffset(ZoneOffset.UTC));
        
        // Validate: end_at must be after start_at
        if (event.getEndAt().isBefore(event.getStartAt()) || event.getEndAt().equals(event.getStartAt())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        event.setAuthorization(authorization);
        event.setStaff(staff);
        event.setEventCode(dto.getEventCode());
        event.setStatus(com.example.backend.model.enums.ScheduleEventStatus.valueOf(dto.getStatus()));
        event.setPlannedUnits(dto.getPlannedUnits());
        event.setComment(dto.getComments());
        event.setCreatedBy(createdBy);

        // Initialize unit summary
        Map<String, Object> unitSummary = new HashMap<>();
        unitSummary.put("plannedUnits", dto.getPlannedUnits());
        event.setUnitSummary(unitSummary);

        return event;
    }
}


