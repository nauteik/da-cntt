package com.example.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.dto.ServiceDeliveryRequestDTO;
import com.example.backend.model.dto.ServiceDeliveryResponseDTO;
import com.example.backend.model.dto.VisitMaintenanceDTO;
import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.Authorization;
import com.example.backend.model.entity.DailyNote;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.ScheduleEvent;
import com.example.backend.model.entity.ServiceDelivery;
import com.example.backend.model.entity.Staff;
import com.example.backend.model.enums.TaskStatus;
import com.example.backend.model.enums.VisitStatus;
import com.example.backend.repository.AuthorizationRepository;
import com.example.backend.repository.DailyNoteRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.ScheduleEventRepository;
import com.example.backend.repository.ServiceDeliveryRepository;
import com.example.backend.repository.ServiceTypeRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.service.ServiceDeliveryService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceDeliveryServiceImpl implements ServiceDeliveryService {

    private final ServiceDeliveryRepository serviceDeliveryRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final AuthorizationRepository authorizationRepository;
    private final StaffRepository staffRepository;
    private final PatientRepository patientRepository;
    private final OfficeRepository officeRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final DailyNoteRepository dailyNoteRepository;

    @Override
    @Transactional
    public ServiceDeliveryResponseDTO create(ServiceDeliveryRequestDTO dto) {
        log.info("Creating service delivery for schedule event: {}", dto.getScheduleEventId());

        // Validate schedule event exists
        ScheduleEvent scheduleEvent = scheduleEventRepository.findById(dto.getScheduleEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule event not found"));

        // Check if service delivery already exists for this schedule event
        boolean exists = serviceDeliveryRepository.existsByScheduleEvent(scheduleEvent);
        if (exists) {
            log.warn("Service delivery already exists for schedule event: {}", dto.getScheduleEventId());
            throw new ValidationException("Service delivery already exists for this schedule event. Each schedule event can only have one service delivery.");
        }

        // Validate authorization if provided
        Authorization authorization = null;
        if (dto.getAuthorizationId() != null) {
            authorization = authorizationRepository.findById(dto.getAuthorizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Authorization not found"));
        } else if (scheduleEvent.getAuthorization() != null) {
            // Tự động lấy authorization từ schedule event nếu không cung cấp
            authorization = scheduleEvent.getAuthorization();
        }

        // Lấy startAt, endAt từ ScheduleEvent nếu không cung cấp
        // Đây là thời gian DỰ KIẾN (planned schedule), KHÔNG thay đổi sau check-in/check-out
        // Thời gian THỰC TẾ được lưu trong CheckEvent và truy cập qua getCheckInTime()/getCheckOutTime()
        LocalDateTime startAt = dto.getStartAt() != null ? 
            dto.getStartAt() : 
            scheduleEvent.getStartAt().toLocalDateTime();
            
        LocalDateTime endAt = dto.getEndAt() != null ? 
            dto.getEndAt() : 
            scheduleEvent.getEndAt().toLocalDateTime();

        // Validate dates
        if (endAt.isBefore(startAt)) {
            throw new ValidationException("End time must be after start time");
        }

        // Lấy units từ ScheduleEvent nếu không cung cấp
        // Units sẽ được cập nhật sau khi check-out dựa trên thời gian thực tế
        Integer units = dto.getUnits() != null ? 
            dto.getUnits() : 
            scheduleEvent.getPlannedUnits();

        // Create service delivery
        ServiceDelivery serviceDelivery = new ServiceDelivery();
        serviceDelivery.setScheduleEvent(scheduleEvent);
        serviceDelivery.setAuthorization(authorization);
        serviceDelivery.setStartAt(startAt);
        serviceDelivery.setEndAt(endAt);
        serviceDelivery.setUnits(units);
        // TaskStatus will be NOT_STARTED by default (set in entity)
        // It will be updated automatically when check-in/check-out events are added
        serviceDelivery.setApprovalStatus(dto.getApprovalStatus() != null ? dto.getApprovalStatus() : "pending");

        // Handle unscheduled visit (staff replacement)
        if (Boolean.TRUE.equals(dto.getIsUnscheduled())) {
            // Validate actualStaffId is provided
            if (dto.getActualStaffId() == null) {
                throw new ValidationException("Actual staff ID is required for unscheduled visits");
            }
            
            // Validate actualStaff exists
            Staff actualStaff = staffRepository.findById(dto.getActualStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Actual staff not found"));
            
            // Set unscheduled visit fields
            serviceDelivery.setIsUnscheduled(true);
            serviceDelivery.setActualStaff(actualStaff);
            serviceDelivery.setUnscheduledReason(dto.getUnscheduledReason());
            
            log.info("Creating unscheduled service delivery - Scheduled staff: {}, Actual staff: {}, Reason: {}", 
                    scheduleEvent.getStaff().getId(), actualStaff.getId(), dto.getUnscheduledReason());
        } else {
            // Normal scheduled visit - actualStaff is same as scheduled staff
            serviceDelivery.setIsUnscheduled(false);
            serviceDelivery.setActualStaff(scheduleEvent.getStaff());
        }

        ServiceDelivery saved = serviceDeliveryRepository.save(serviceDelivery);
        log.info("Service delivery created with ID: {} (initial units: {}, unscheduled: {})", 
                saved.getId(), units, saved.getIsUnscheduled());

        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ServiceDeliveryResponseDTO getById(UUID id) {
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));
        return toDto(serviceDelivery);
    }

    @Override
    @Transactional
    public ServiceDeliveryResponseDTO update(UUID id, ServiceDeliveryRequestDTO dto) {
        log.info("Updating service delivery: {}", id);

        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));

        // Update schedule event if changed
        if (!serviceDelivery.getScheduleEvent().getId().equals(dto.getScheduleEventId())) {
            ScheduleEvent scheduleEvent = scheduleEventRepository.findById(dto.getScheduleEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Schedule event not found"));
            serviceDelivery.setScheduleEvent(scheduleEvent);
        }

        // Update authorization if changed
        if (dto.getAuthorizationId() != null) {
            if (serviceDelivery.getAuthorization() == null || 
                !serviceDelivery.getAuthorization().getId().equals(dto.getAuthorizationId())) {
                Authorization authorization = authorizationRepository.findById(dto.getAuthorizationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Authorization not found"));
                serviceDelivery.setAuthorization(authorization);
            }
        } else {
            serviceDelivery.setAuthorization(null);
        }

        // Validate dates
        if (dto.getEndAt().isBefore(dto.getStartAt())) {
            throw new ValidationException("End time must be after start time");
        }

        // Update fields
        serviceDelivery.setStartAt(dto.getStartAt());
        serviceDelivery.setEndAt(dto.getEndAt());
        
        // Update units only if provided, otherwise keep existing or use schedule's planned units
        if (dto.getUnits() != null) {
            serviceDelivery.setUnits(dto.getUnits());
        } else if (serviceDelivery.getUnits() == null) {
            // If existing units is null, get from schedule event
            serviceDelivery.setUnits(serviceDelivery.getScheduleEvent().getPlannedUnits());
        }
        // If dto.getUnits() is null but serviceDelivery.getUnits() exists, keep existing value
        
        // Handle unscheduled visit (staff replacement)
        if (dto.getIsUnscheduled() != null && dto.getIsUnscheduled()) {
            if (dto.getActualStaffId() == null) {
                throw new ValidationException("Actual staff is required for unscheduled visits");
            }
            
            Staff actualStaff = staffRepository.findById(dto.getActualStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Actual staff not found"));
            
            serviceDelivery.setIsUnscheduled(true);
            serviceDelivery.setActualStaff(actualStaff);
            serviceDelivery.setUnscheduledReason(dto.getUnscheduledReason());
            
            log.info("Updating service delivery to unscheduled - Scheduled staff: {}, Actual staff: {}, Reason: {}",
                    serviceDelivery.getScheduleEvent().getStaff().getFirstName() + " " + serviceDelivery.getScheduleEvent().getStaff().getLastName(),
                    actualStaff.getFirstName() + " " + actualStaff.getLastName(),
                    dto.getUnscheduledReason());
        } else {
            // Reset unscheduled fields if converting back to scheduled
            serviceDelivery.setIsUnscheduled(false);
            serviceDelivery.setActualStaff(null);
            serviceDelivery.setUnscheduledReason(null);
        }
        
        // Note: TaskStatus is automatically managed based on check-in/check-out events
        // Manual status updates should use updateTaskStatus() method
        
        if (dto.getApprovalStatus() != null) {
            serviceDelivery.setApprovalStatus(dto.getApprovalStatus());
        }

        ServiceDelivery saved = serviceDeliveryRepository.save(serviceDelivery);
        log.info("Service delivery updated: {}", id);

        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        log.info("Deleting service delivery: {}", id);
        
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));
        
        serviceDeliveryRepository.delete(serviceDelivery);
        log.info("Service delivery deleted: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ServiceDeliveryResponseDTO> list(int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<ServiceDelivery> serviceDeliveries = serviceDeliveryRepository.findAll(pageable);
        
        List<ServiceDeliveryResponseDTO> content = serviceDeliveries.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        
        return new PageImpl<>(content, pageable, serviceDeliveries.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDeliveryResponseDTO> getByStaff(UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        
        return serviceDeliveryRepository.findByStaffOrderByStartAtDesc(staff).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDeliveryResponseDTO> getByPatient(UUID patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
        
        return serviceDeliveryRepository.findByPatientOrderByStartAtDesc(patient).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDeliveryResponseDTO> getByOffice(UUID officeId) {
        Office office = officeRepository.findById(officeId)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found"));
        
        return serviceDeliveryRepository.findByOfficeOrderByStartAtDesc(office).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDeliveryResponseDTO> getByDateRange(LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);
        
        return serviceDeliveryRepository.findByDateRange(startDateTime, endDateTime).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceDeliveryResponseDTO> getByTaskStatus(TaskStatus taskStatus) {
        return serviceDeliveryRepository.findByTaskStatusOrderByStartAtDesc(taskStatus).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceDeliveryResponseDTO updateTaskStatus(UUID id, TaskStatus taskStatus) {
        log.info("Updating service delivery task status: {} to {}", id, taskStatus);
        
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));
        
        serviceDelivery.setTaskStatus(taskStatus);
        ServiceDelivery saved = serviceDeliveryRepository.save(serviceDelivery);
        
        return toDto(saved);
    }

    @Override
    @Transactional
    public ServiceDeliveryResponseDTO updateApprovalStatus(UUID id, String approvalStatus) {
        log.info("Updating service delivery approval status: {} to {}", id, approvalStatus);
        
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));
        
        serviceDelivery.setApprovalStatus(approvalStatus);
        ServiceDelivery saved = serviceDeliveryRepository.save(serviceDelivery);
        
        return toDto(saved);
    }

    @Override
    @Transactional
    public ServiceDeliveryResponseDTO cancel(UUID id, String reason) {
        log.info("Cancelling service delivery {} with reason: {}", id, reason);
        
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));
        
        // Check if already cancelled
        if (serviceDelivery.isCancelled()) {
            throw new ValidationException("Service delivery is already cancelled");
        }
        
        // Soft cancel: Allow cancel even if IN_PROGRESS, but not if COMPLETED with daily note
        // This allows staff to still check-out and complete documentation
        if (serviceDelivery.isCompleted()) {
            throw new ValidationException("Cannot cancel a completed service delivery with daily note");
        }
        
        // Validate reason
        if (reason == null || reason.trim().isEmpty()) {
            throw new ValidationException("Cancel reason is required");
        }
        
        // Get current authenticated staff (from SecurityContext)
        // For now, we'll use a placeholder - you should implement proper authentication
        Staff cancelledBy = null;
        // TODO: Get current staff from SecurityContextHolder
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // String staffId = auth.getName();
        // cancelledBy = staffRepository.findById(UUID.fromString(staffId)).orElse(null);
        
        // Cancel the service delivery (soft cancel - staff can still check-out)
        serviceDelivery.cancel(reason, cancelledBy);
        ServiceDelivery saved = serviceDeliveryRepository.save(serviceDelivery);
        
        log.info("Cancelled service delivery {} by staff {} (status: {})", 
                 id, cancelledBy != null ? cancelledBy.getId() : "system", saved.getTaskStatus());
        return toDto(saved);
    }

    /**
     * Convert entity to DTO
     */
    private ServiceDeliveryResponseDTO toDto(ServiceDelivery serviceDelivery) {
        ServiceDeliveryResponseDTO dto = new ServiceDeliveryResponseDTO();
        
        dto.setId(serviceDelivery.getId());
        dto.setScheduleEventId(serviceDelivery.getScheduleEvent().getId());
        dto.setAuthorizationId(serviceDelivery.getAuthorization() != null ? 
                serviceDelivery.getAuthorization().getId() : null);
        
        // Get office, patient, staff from schedule event
        Office office = serviceDelivery.getOffice();
        if (office != null) {
            dto.setOfficeId(office.getId());
            dto.setOfficeName(office.getName());
        }
        
        Patient patient = serviceDelivery.getPatient();
        if (patient != null) {
            dto.setPatientId(patient.getId());
            dto.setPatientName(patient.getFirstName() + " " + patient.getLastName());
            
            // Get patient's main address
            patient.getPatientAddresses().stream()
                    .filter(pa -> Boolean.TRUE.equals(pa.getIsMain()))
                    .findFirst()
                    .ifPresent(patientAddress -> {
                        Address address = patientAddress.getAddress();
                        if (address != null) {
                            dto.setPatientAddress(address.getFullAddress());
                            dto.setPatientCity(address.getCity());
                            dto.setPatientState(address.getState());
                            dto.setPatientZipCode(address.getPostalCode());
                        }
                    });
        }
        
        Staff staff = serviceDelivery.getStaff();
        if (staff != null) {
            dto.setStaffId(staff.getId());
            dto.setStaffName(staff.getFirstName() + " " + staff.getLastName());
        }
        
        // Service delivery info
        dto.setStartAt(serviceDelivery.getStartAt());
        dto.setEndAt(serviceDelivery.getEndAt());
        dto.setUnits(serviceDelivery.getUnits());
        // Use calculated task status for accurate display
        TaskStatus currentStatus = serviceDelivery.calculateCurrentTaskStatus();
        dto.setTaskStatus(currentStatus);
        dto.setStatus(currentStatus.name()); // For backward compatibility
        dto.setApprovalStatus(serviceDelivery.getApprovalStatus());
        dto.setTotalHours(serviceDelivery.getTotalHours());
        
        // Check-in/check-out summary
        dto.setCheckInTime(serviceDelivery.getCheckInTime());
        dto.setCheckOutTime(serviceDelivery.getCheckOutTime());
        dto.setIsCheckInCheckOutCompleted(serviceDelivery.isCheckInCheckOutCompleted());
        dto.setIsCheckInCheckOutFullyValid(serviceDelivery.isCheckInCheckOutFullyValid());
        
        // Daily note summary - check if daily note exists for this service delivery
        dailyNoteRepository.findFirstByServiceDelivery_IdOrderByCreatedAtDesc(serviceDelivery.getId())
                .ifPresent(dailyNote -> dto.setDailyNoteId(dailyNote.getId()));
        
        // Cancel information
        dto.setCancelled(serviceDelivery.isCancelled());
        dto.setCancelReason(serviceDelivery.getCancelReason());
        dto.setCancelledAt(serviceDelivery.getCancelledAt());
        if (serviceDelivery.getCancelledByStaff() != null) {
            dto.setCancelledByStaffId(serviceDelivery.getCancelledByStaff().getId());
            dto.setCancelledByStaffName(
                serviceDelivery.getCancelledByStaff().getFirstName() + " " + 
                serviceDelivery.getCancelledByStaff().getLastName()
            );
        }
        
        // Unscheduled visit (staff replacement) information
        dto.setIsUnscheduled(serviceDelivery.getIsUnscheduled());
        dto.setUnscheduledReason(serviceDelivery.getUnscheduledReason());
        
        // Actual staff (who performs the service)
        if (serviceDelivery.getActualStaff() != null) {
            Staff actualStaff = serviceDelivery.getActualStaff();
            dto.setActualStaffId(actualStaff.getId());
            dto.setActualStaffName(actualStaff.getFirstName() + " " + actualStaff.getLastName());
        }
        
        // Scheduled staff (from schedule event)
        if (serviceDelivery.getScheduledStaff() != null) {
            Staff scheduledStaff = serviceDelivery.getScheduledStaff();
            dto.setScheduledStaffId(scheduledStaff.getId());
            dto.setScheduledStaffName(scheduledStaff.getFirstName() + " " + scheduledStaff.getLastName());
        }
        
        // Metadata
        dto.setCreatedAt(serviceDelivery.getCreatedAt());
        dto.setUpdatedAt(serviceDelivery.getUpdatedAt());
        
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VisitMaintenanceDTO> getVisitMaintenance(
            LocalDate startDate,
            LocalDate endDate,
            UUID clientId,
            UUID employeeId,
            UUID officeId,
            VisitStatus status,
            String search,
            Boolean cancelled,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        log.info("Getting visit maintenance data - page: {}, size: {}, sortBy: {}, sortDir: {}",
                page, size, sortBy, sortDir);

        // Build query filters
        List<ServiceDelivery> allDeliveries;
        
        if (startDate != null && endDate != null) {
            LocalDateTime start = startDate.atStartOfDay();
            LocalDateTime end = endDate.atTime(LocalTime.MAX);
            allDeliveries = serviceDeliveryRepository.findByDateRange(start, end);
        } else {
            allDeliveries = serviceDeliveryRepository.findAll();
        }

        // Apply filters
        List<ServiceDelivery> filteredDeliveries = allDeliveries.stream()
                .filter(delivery -> {
                    // Client filter
                    if (clientId != null && !delivery.getScheduleEvent().getPatient().getId().equals(clientId)) {
                        return false;
                    }
                    
                    // Employee filter (check both scheduled and actual staff)
                    if (employeeId != null) {
                        boolean matchesScheduled = delivery.getScheduleEvent().getStaff().getId().equals(employeeId);
                        boolean matchesActual = delivery.getActualStaff() != null && 
                                              delivery.getActualStaff().getId().equals(employeeId);
                        if (!matchesScheduled && !matchesActual) {
                            return false;
                        }
                    }
                    
                    // Office filter
                    if (officeId != null && !delivery.getScheduleEvent().getOffice().getId().equals(officeId)) {
                        return false;
                    }
                    
                    // Cancelled filter
                    if (cancelled != null && delivery.getCancelled() != cancelled) {
                        return false;
                    }
                    
                    // Search filter
                    if (search != null && !search.trim().isEmpty()) {
                        String searchLower = search.toLowerCase();
                        Patient patient = delivery.getScheduleEvent().getPatient();
                        String clientName = (patient.getFirstName() + " " + patient.getLastName()).toLowerCase();
                        Staff actualStaff = delivery.getIsUnscheduled() && delivery.getActualStaff() != null
                                ? delivery.getActualStaff()
                                : delivery.getScheduleEvent().getStaff();
                        String employeeName = (actualStaff.getFirstName() + " " + actualStaff.getLastName()).toLowerCase();
                        
                        // Get service name from event_code
                        String serviceName = "";
                        String eventCode = delivery.getScheduleEvent().getEventCode();
                        if (eventCode != null) {
                            serviceName = serviceTypeRepository.findByCode(eventCode)
                                    .map(s -> s.getName().toLowerCase())
                                    .orElse("");
                        }
                        
                        if (!clientName.contains(searchLower) && 
                            !employeeName.contains(searchLower) && 
                            !serviceName.contains(searchLower)) {
                            return false;
                        }
                    }
                    
                    return true;
                })
                .collect(Collectors.toList());

        // Apply sorting
        filteredDeliveries.sort((a, b) -> {
            int comparison = 0;
            if ("startAt".equals(sortBy) || "visitDate".equals(sortBy)) {
                comparison = a.getStartAt().compareTo(b.getStartAt());
            } else if ("clientName".equals(sortBy)) {
                Patient patientA = a.getScheduleEvent().getPatient();
                Patient patientB = b.getScheduleEvent().getPatient();
                String nameA = patientA.getFirstName() + " " + patientA.getLastName();
                String nameB = patientB.getFirstName() + " " + patientB.getLastName();
                comparison = nameA.compareTo(nameB);
            } else if ("employeeName".equals(sortBy)) {
                Staff staffA = a.getIsUnscheduled() && a.getActualStaff() != null
                        ? a.getActualStaff() : a.getScheduleEvent().getStaff();
                Staff staffB = b.getIsUnscheduled() && b.getActualStaff() != null
                        ? b.getActualStaff() : b.getScheduleEvent().getStaff();
                String nameA = staffA.getFirstName() + " " + staffA.getLastName();
                String nameB = staffB.getFirstName() + " " + staffB.getLastName();
                comparison = nameA.compareTo(nameB);
            }
            return "desc".equalsIgnoreCase(sortDir) ? -comparison : comparison;
        });

        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, filteredDeliveries.size());
        List<ServiceDelivery> pagedDeliveries = start < filteredDeliveries.size()
                ? filteredDeliveries.subList(start, end)
                : List.of();

        // Convert to DTOs
        List<VisitMaintenanceDTO> visitDTOs = pagedDeliveries.stream()
                .map(this::mapToVisitMaintenanceDTO)
                .collect(Collectors.toList());

        // Filter by status if provided (done after mapping because status is calculated)
        if (status != null) {
            visitDTOs = visitDTOs.stream()
                    .filter(dto -> dto.getVisitStatus() == status)
                    .collect(Collectors.toList());
        }

        return new PageImpl<>(visitDTOs, PageRequest.of(page, size), filteredDeliveries.size());
    }

    /**
    /**
     * Map ServiceDelivery entity to VisitMaintenanceDTO with calculated fields
     */
    private VisitMaintenanceDTO mapToVisitMaintenanceDTO(ServiceDelivery delivery) {
        var schedule = delivery.getScheduleEvent();
        var patient = schedule.getPatient();
        
        // Get service type from event_code
        String serviceName = "Unknown";
        String serviceCode = schedule.getEventCode();
        if (serviceCode != null) {
            var serviceType = serviceTypeRepository.findByCode(serviceCode);
            if (serviceType.isPresent()) {
                serviceName = serviceType.get().getName();
            }
        }
        
        // Determine actual staff (for unscheduled visits, use actualStaff; otherwise use scheduled staff)
        var actualStaff = delivery.getIsUnscheduled() && delivery.getActualStaff() != null
                ? delivery.getActualStaff()
                : schedule.getStaff();

        // Get check-in/check-out times
        LocalDateTime callInTime = delivery.getCheckInTime();
        LocalDateTime callOutTime = delivery.getCheckOutTime();

        // Calculate scheduled hours
        LocalDateTime scheduledIn = delivery.getStartAt();
        LocalDateTime scheduledOut = delivery.getEndAt();
        double scheduledHours = java.time.temporal.ChronoUnit.MINUTES.between(scheduledIn, scheduledOut) / 60.0;

        // Calculate call hours
        Double callHours = null;
        if (callInTime != null && callOutTime != null) {
            callHours = java.time.temporal.ChronoUnit.MINUTES.between(callInTime, callOutTime) / 60.0;
        }

        // Calculate adjusted hours (same as call hours for now; TODO: add manual adjustment support)
        Double adjustedHours = callHours;

        // Calculate pay and bill hours
        Double payHours = adjustedHours != null ? adjustedHours : 0.0;
        Double billHours = adjustedHours != null ? adjustedHours : 0.0;

        // Convert to 15-minute units for billing
        Integer units = billHours != null ? (int) Math.ceil(billHours * 4) : 0;

        // Determine visit status
        VisitStatus visitStatus = com.example.backend.model.enums.VisitStatus.determineStatus(
                callInTime, callOutTime, scheduledOut, delivery.getCancelled(), false);

        // Format dates and times
        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("MM/dd/yyyy");
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("hh:mm a");

        // Map Check Events (Check-in/Check-out) with GPS tracking
        com.example.backend.model.dto.CheckEventDTO checkInEventDTO = null;
        com.example.backend.model.dto.CheckEventDTO checkOutEventDTO = null;
        
        var checkInEvent = delivery.getCheckInEvent();
        if (checkInEvent != null) {
            checkInEventDTO = com.example.backend.model.dto.CheckEventDTO.builder()
                    .timestamp(checkInEvent.getOccurredAt())
                    .eventType(checkInEvent.getEventType())
                    .latitude(checkInEvent.getLatitude() != null ? checkInEvent.getLatitude().doubleValue() : null)
                    .longitude(checkInEvent.getLongitude() != null ? checkInEvent.getLongitude().doubleValue() : null)
                    .accuracyMeters(checkInEvent.getAccuracyM() != null ? checkInEvent.getAccuracyM().doubleValue() : null)
                    .method(checkInEvent.getMethod())
                    .status(checkInEvent.getStatus())
                    .build();
        }
        
        var checkOutEvent = delivery.getCheckOutEvent();
        if (checkOutEvent != null) {
            checkOutEventDTO = com.example.backend.model.dto.CheckEventDTO.builder()
                    .timestamp(checkOutEvent.getOccurredAt())
                    .eventType(checkOutEvent.getEventType())
                    .latitude(checkOutEvent.getLatitude() != null ? checkOutEvent.getLatitude().doubleValue() : null)
                    .longitude(checkOutEvent.getLongitude() != null ? checkOutEvent.getLongitude().doubleValue() : null)
                    .accuracyMeters(checkOutEvent.getAccuracyM() != null ? checkOutEvent.getAccuracyM().doubleValue() : null)
                    .method(checkOutEvent.getMethod())
                    .status(checkOutEvent.getStatus())
                    .build();
        }

        return VisitMaintenanceDTO.builder()
                .serviceDeliveryId(delivery.getId())
                .scheduleEventId(schedule.getId())
                .clientId(patient.getId())
                .clientName(patient.getFirstName() + " " + patient.getLastName())
                .clientMedicaidId(patient.getMedicaidId())
                .employeeId(actualStaff.getId())
                .employeeName(actualStaff.getFirstName() + " " + actualStaff.getLastName())
                .employeeCode(actualStaff.getEmployeeId())
                .serviceName(serviceName)
                .serviceCode(serviceCode)
                .visitDate(scheduledIn.format(dateFormatter))
                .scheduledTimeIn(scheduledIn.format(timeFormatter))
                .scheduledTimeOut(scheduledOut.format(timeFormatter))
                .scheduledHours(scheduledHours)
                .callIn(callInTime != null ? callInTime.format(timeFormatter) : null)
                .callOut(callOutTime != null ? callOutTime.format(timeFormatter) : null)
                .callHours(callHours)
                .adjustedIn(callInTime != null ? callInTime.format(timeFormatter) : null)
                .adjustedOut(callOutTime != null ? callOutTime.format(timeFormatter) : null)
                .adjustedHours(adjustedHours)
                .payHours(payHours)
                .billHours(billHours)
                .units(units)
                .doNotBill(delivery.getCancelled())
                .visitStatus(visitStatus)
                .visitStatusDisplay(visitStatus.getDisplayName())
                .notes(null) // Notes field reserved for future use
                .isUnscheduled(delivery.getIsUnscheduled())
                .unscheduledReason(delivery.getUnscheduledReason())
                .authorizationNumber(delivery.getAuthorization() != null 
                        ? delivery.getAuthorization().getAuthorizationNo() 
                        : null)
                .checkInEvent(checkInEventDTO)
                .checkOutEvent(checkOutEventDTO)
                .totalDistanceMeters(delivery.getTotalDistanceMeters())
                .totalDistanceFormatted(formatDistance(delivery.getTotalDistanceMeters()))
                .trackingPointsCount(null) // Will be populated on-demand if needed
                .dailyNoteId(delivery.getDailyNotes().stream()
                        .findFirst()
                        .map(DailyNote::getId)
                        .orElse(null))
                .dailyNoteContent(delivery.getDailyNotes().stream()
                        .findFirst()
                        .map(DailyNote::getContent)
                        .orElse(null))
                .cancelled(delivery.getCancelled())
                .cancelReason(delivery.getCancelReason())
                .cancelledAt(delivery.getCancelledAt())
                .cancelledByStaffId(delivery.getCancelledByStaff() != null 
                        ? delivery.getCancelledByStaff().getId() 
                        : null)
                .cancelledByStaffName(delivery.getCancelledByStaff() != null 
                        ? delivery.getCancelledByStaff().getFirstName() + " " + delivery.getCancelledByStaff().getLastName()
                        : null)
                .createdAt(delivery.getCreatedAt())
                .updatedAt(delivery.getUpdatedAt())
                .build();
    }
    
    /**
     * Format distance for display
     */
    private String formatDistance(java.math.BigDecimal meters) {
        if (meters == null) {
            return null;
        }
        if (meters.compareTo(java.math.BigDecimal.valueOf(1000)) >= 0) {
            java.math.BigDecimal km = meters.divide(java.math.BigDecimal.valueOf(1000), 2, java.math.RoundingMode.HALF_UP);
            return km + " km";
        }
        return meters.setScale(0, java.math.RoundingMode.HALF_UP) + " m";
    }

    @Override
    @Transactional(readOnly = true)
    public VisitMaintenanceDTO getVisitMaintenanceById(UUID id) {
        log.info("Getting visit maintenance detail for service delivery: {}", id);
        
        ServiceDelivery delivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service delivery not found with id: " + id));
        
        return mapToVisitMaintenanceDTO(delivery);
    }
}
