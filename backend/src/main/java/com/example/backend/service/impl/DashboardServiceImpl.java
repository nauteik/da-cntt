package com.example.backend.service.impl;

import com.example.backend.model.dto.dashboard.AlertDTO;
import com.example.backend.model.dto.dashboard.DashboardStatsDTO;
import com.example.backend.model.dto.dashboard.RecentActivityDTO;
import com.example.backend.model.dto.dashboard.ScheduleEventStatsDTO;
import com.example.backend.model.entity.Authorization;
import com.example.backend.model.entity.CheckEvent;
import com.example.backend.model.entity.ScheduleEvent;
import com.example.backend.model.enums.ScheduleEventStatus;
import com.example.backend.model.enums.TaskStatus;
import com.example.backend.repository.*;
import com.example.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Implementation of DashboardService
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final PatientRepository patientRepository;
    private final StaffRepository staffRepository;
    private final ScheduleEventRepository scheduleEventRepository;
    private final ServiceDeliveryRepository serviceDeliveryRepository;
    private final AuthorizationRepository authorizationRepository;
    private final CheckEventRepository checkEventRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats(LocalDate fromDate, LocalDate toDate, UUID officeId) {
        log.info("Fetching dashboard stats from {} to {}, officeId: {}", fromDate, toDate, officeId);

        // Convert date range to LocalDateTime for service delivery queries
        LocalDateTime fromDateTime = fromDate.atStartOfDay();
        LocalDateTime toDateTime = toDate.atTime(LocalTime.MAX);

        // Get patient and staff counts
        long totalPatients = officeId != null 
            ? patientRepository.countByOfficeIdAndDeletedAtIsNull(officeId)
            : patientRepository.count();
        
        long activePatients = officeId != null
            ? patientRepository.countActiveByOfficeId(officeId)
            : patientRepository.findByStatusAndDeletedAtIsNull(
                com.example.backend.model.enums.PatientStatus.ACTIVE
            ).size();

        long totalStaff = officeId != null
            ? staffRepository.countByOfficeId(officeId)
            : staffRepository.count();
        
        long activeStaff = officeId != null
            ? staffRepository.countActiveByOfficeId(officeId)
            : staffRepository.findByIsActiveTrueAndDeletedAtIsNull().size();

        // Get schedule event counts by status
        long totalScheduleEvents = officeId != null
            ? scheduleEventRepository.countByOfficeAndDateRange(officeId, fromDate, toDate)
            : scheduleEventRepository.countByDateRange(fromDate, toDate);

        long plannedEvents = scheduleEventRepository.countByStatusAndDateRange(
            ScheduleEventStatus.PLANNED, fromDate, toDate);
        long confirmedEvents = scheduleEventRepository.countByStatusAndDateRange(
            ScheduleEventStatus.CONFIRMED, fromDate, toDate);
        long inProgressEvents = scheduleEventRepository.countByStatusAndDateRange(
            ScheduleEventStatus.IN_PROGRESS, fromDate, toDate);
        long completedEvents = scheduleEventRepository.countByStatusAndDateRange(
            ScheduleEventStatus.COMPLETED, fromDate, toDate);
        long cancelledEvents = scheduleEventRepository.countByStatusAndDateRange(
            ScheduleEventStatus.CANCELLED, fromDate, toDate);

        // Get service delivery counts by task status
        long totalServiceDeliveries = serviceDeliveryRepository.countByDateRange(
            fromDateTime, toDateTime);
        long cancelledDeliveries = serviceDeliveryRepository.countCancelledByDateRange(
            fromDateTime, toDateTime);

        long notStartedDeliveries = serviceDeliveryRepository.countByTaskStatusAndDateRange(
            TaskStatus.NOT_STARTED, fromDateTime, toDateTime);
        long inProgressDeliveries = serviceDeliveryRepository.countByTaskStatusAndDateRange(
            TaskStatus.IN_PROGRESS, fromDateTime, toDateTime);
        long completedDeliveries = serviceDeliveryRepository.countByTaskStatusAndDateRange(
            TaskStatus.COMPLETED, fromDateTime, toDateTime);
        long incompleteDeliveries = serviceDeliveryRepository.countByTaskStatusAndDateRange(
            TaskStatus.INCOMPLETE, fromDateTime, toDateTime);

        return DashboardStatsDTO.builder()
            .totalPatients(totalPatients)
            .activePatients(activePatients)
            .totalStaff(totalStaff)
            .activeStaff(activeStaff)
            .totalScheduleEvents(totalScheduleEvents)
            .plannedEvents(plannedEvents)
            .confirmedEvents(confirmedEvents)
            .inProgressEvents(inProgressEvents)
            .completedEvents(completedEvents)
            .cancelledEvents(cancelledEvents)
            .totalServiceDeliveries(totalServiceDeliveries + cancelledDeliveries)
            .notStartedDeliveries(notStartedDeliveries)
            .inProgressDeliveries(inProgressDeliveries)
            .completedDeliveries(completedDeliveries)
            .incompleteDeliveries(incompleteDeliveries)
            .cancelledDeliveries(cancelledDeliveries)
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleEventStatsDTO> getScheduleEventStats(LocalDate fromDate, LocalDate toDate, String groupBy) {
        log.info("Fetching schedule event stats from {} to {}, groupBy: {}", fromDate, toDate, groupBy);

        // Get raw data from repository
        List<Object[]> rawStats = scheduleEventRepository.getEventStatsByDay(fromDate, toDate);

        // Group by date and status
        Map<LocalDate, Map<String, Long>> statsByDate = new HashMap<>();
        
        for (Object[] row : rawStats) {
            // Convert java.sql.Date to java.time.LocalDate
            LocalDate date = row[0] instanceof java.sql.Date 
                ? ((java.sql.Date) row[0]).toLocalDate() 
                : (LocalDate) row[0];
            String status = (String) row[1];
            Long count = ((Number) row[2]).longValue();
            
            statsByDate.computeIfAbsent(date, k -> new HashMap<>())
                .put(status, count);
        }

        // Build result list
        List<ScheduleEventStatsDTO> result = new ArrayList<>();
        
        // Fill in all dates in range (even if no events)
        LocalDate currentDate = fromDate;
        while (!currentDate.isAfter(toDate)) {
            Map<String, Long> statusCounts = statsByDate.getOrDefault(currentDate, new HashMap<>());
            
            long planned = statusCounts.getOrDefault("PLANNED", 0L);
            long confirmed = statusCounts.getOrDefault("CONFIRMED", 0L);
            long inProgress = statusCounts.getOrDefault("IN_PROGRESS", 0L);
            long completed = statusCounts.getOrDefault("COMPLETED", 0L);
            long cancelled = statusCounts.getOrDefault("CANCELLED", 0L);
            long total = planned + confirmed + inProgress + completed + cancelled;
            
            result.add(ScheduleEventStatsDTO.builder()
                .date(currentDate)
                .planned(planned)
                .confirmed(confirmed)
                .inProgress(inProgress)
                .completed(completed)
                .cancelled(cancelled)
                .total(total)
                .build());
            
            currentDate = currentDate.plusDays(1);
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RecentActivityDTO> getRecentActivities(LocalDateTime fromDateTime, int page, int size) {
        log.info("Fetching recent activities from {}, page: {}, size: {}", fromDateTime, page, size);

        List<RecentActivityDTO> activities = new ArrayList<>();

        // Get recent check events
        Pageable checkEventPageable = PageRequest.of(0, size);
        Page<CheckEvent> recentCheckEvents = checkEventRepository.findRecentCheckEvents(
            fromDateTime, checkEventPageable);
        
        for (CheckEvent ce : recentCheckEvents.getContent()) {
            String activityType = ce.getEventType().name(); // CHECK_IN or CHECK_OUT
            String staffName = ce.getServiceDelivery() != null && 
                              ce.getServiceDelivery().getStaff() != null
                ? ce.getServiceDelivery().getStaff().getFullName()
                : "Unknown Staff";
            
            String patientName = ce.getServiceDelivery() != null && 
                                ce.getServiceDelivery().getPatient() != null
                ? ce.getServiceDelivery().getPatient().getFullName()
                : "Unknown Patient";

            String description = String.format("%s %s shift with %s",
                staffName,
                activityType.equals("CHECK_IN") ? "checked in" : "checked out",
                patientName);

            String status = ce.isOK() ? "success" : "warning";

            activities.add(RecentActivityDTO.builder()
                .id(ce.getId().toString())
                .type(activityType)
                .time(ce.getOccurredAt())
                .description(description)
                .staffName(staffName)
                .patientName(patientName)
                .status(status)
                .build());
        }

        // Get recent schedule events
        OffsetDateTime fromOffsetDateTime = fromDateTime.atOffset(ZoneOffset.UTC);
        Pageable scheduleEventPageable = PageRequest.of(0, size);
        Page<ScheduleEvent> recentScheduleEvents = scheduleEventRepository.findRecentEvents(
            fromOffsetDateTime, scheduleEventPageable);
        
        for (ScheduleEvent se : recentScheduleEvents.getContent()) {
            String staffName = se.getStaff() != null 
                ? se.getStaff().getFullName()
                : "Unassigned";
            
            String patientName = se.getPatient() != null
                ? se.getPatient().getFullName()
                : "Unknown Patient";

            String description = String.format("Schedule event created for %s with %s",
                patientName, staffName);

            activities.add(RecentActivityDTO.builder()
                .id(se.getId().toString())
                .type("SCHEDULE_CREATED")
                .time(se.getCreatedAt().toLocalDateTime())
                .description(description)
                .staffName(staffName)
                .patientName(patientName)
                .status("info")
                .build());
        }

        // Sort by time descending and paginate
        activities.sort((a, b) -> b.getTime().compareTo(a.getTime()));
        
        int start = page * size;
        int end = Math.min(start + size, activities.size());
        List<RecentActivityDTO> pageContent = start < activities.size() 
            ? activities.subList(start, end)
            : new ArrayList<>();

        return new PageImpl<>(pageContent, PageRequest.of(page, size), activities.size());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AlertDTO> getAlerts(UUID officeId) {
        log.info("Fetching dashboard alerts, officeId: {}", officeId);

        List<AlertDTO> alerts = new ArrayList<>();

        // Get authorizations expiring within 30 days
        LocalDate expiryDate = LocalDate.now().plusDays(30);
        Pageable pageable = PageRequest.of(0, 10);
        List<Authorization> expiringAuths = authorizationRepository.findExpiringAuthorizations(
            expiryDate, pageable);

        for (Authorization auth : expiringAuths) {
            long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), auth.getEndDate());
            
            String severity = daysUntil <= 7 ? "high" : daysUntil <= 14 ? "medium" : "low";
            
            String patientName = auth.getPatient() != null
                ? auth.getPatient().getFullName()
                : "Unknown Patient";
            
            String serviceType = auth.getPatientService() != null && 
                                auth.getPatientService().getServiceType() != null
                ? auth.getPatientService().getServiceType().getName()
                : "Unknown Service";

            String message = String.format(
                "Authorization %s expires in %d days",
                auth.getAuthorizationNo(),
                daysUntil
            );

            alerts.add(AlertDTO.builder()
                .id(auth.getId().toString())
                .type("AUTHORIZATION_EXPIRING")
                .severity(severity)
                .message(message)
                .entity(auth.getAuthorizationNo())
                .expiryDate(auth.getEndDate())
                .daysUntilExpiry((int) daysUntil)
                .patientName(patientName)
                .authorizationNo(auth.getAuthorizationNo())
                .serviceType(serviceType)
                .build());
        }

        // Sort by days until expiry (most urgent first)
        alerts.sort(Comparator.comparing(AlertDTO::getDaysUntilExpiry));

        return alerts;
    }
}
