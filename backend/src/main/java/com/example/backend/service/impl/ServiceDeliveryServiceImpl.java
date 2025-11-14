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

import com.example.backend.dto.ServiceDeliveryRequestDTO;
import com.example.backend.dto.ServiceDeliveryResponseDTO;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.entity.Authorization;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.ScheduleEvent;
import com.example.backend.model.entity.ServiceDelivery;
import com.example.backend.model.entity.Staff;
import com.example.backend.repository.AuthorizationRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.ScheduleEventRepository;
import com.example.backend.repository.ServiceDeliveryRepository;
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
        serviceDelivery.setStatus(dto.getStatus() != null ? dto.getStatus() : "in_progress");
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
        serviceDelivery.setUnits(dto.getUnits());
        
        if (dto.getStatus() != null) {
            serviceDelivery.setStatus(dto.getStatus());
        }
        
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
    public List<ServiceDeliveryResponseDTO> getByStatus(String status) {
        return serviceDeliveryRepository.findByStatusOrderByStartAtDesc(status).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ServiceDeliveryResponseDTO updateStatus(UUID id, String status) {
        log.info("Updating service delivery status: {} to {}", id, status);
        
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));
        
        serviceDelivery.setStatus(status);
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
        
        // Check if already completed
        if (serviceDelivery.isCompleted()) {
            throw new ValidationException("Cannot cancel a completed service delivery");
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
        
        // Cancel the service delivery
        serviceDelivery.cancel(reason, cancelledBy);
        ServiceDelivery saved = serviceDeliveryRepository.save(serviceDelivery);
        
        log.info("Cancelled service delivery {} by staff {}", id, cancelledBy != null ? cancelledBy.getId() : "system");
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
        dto.setStatus(serviceDelivery.getStatus());
        dto.setApprovalStatus(serviceDelivery.getApprovalStatus());
        dto.setTotalHours(serviceDelivery.getTotalHours());
        
        // Check-in/check-out summary
        dto.setCheckInTime(serviceDelivery.getCheckInTime());
        dto.setCheckOutTime(serviceDelivery.getCheckOutTime());
        dto.setIsCheckInCheckOutCompleted(serviceDelivery.isCheckInCheckOutCompleted());
        dto.setIsCheckInCheckOutFullyValid(serviceDelivery.isCheckInCheckOutFullyValid());
        
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
}
