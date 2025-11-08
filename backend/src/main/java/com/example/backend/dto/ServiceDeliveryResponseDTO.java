package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

/**
 * Response DTO for ServiceDelivery
 */
@Data
public class ServiceDeliveryResponseDTO {

    private UUID id;
    
    // Related entities
    private UUID scheduleEventId;
    private UUID authorizationId;
    private UUID officeId;
    private String officeName;
    private UUID patientId;
    private String patientName;
    private UUID staffId;
    private String staffName;

    // Service delivery info
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer units;
    private String status;
    private String approvalStatus;
    private Double totalHours;

    // Check-in/check-out summary
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Boolean isCheckInCheckOutCompleted;
    private Boolean isCheckInCheckOutFullyValid;

    // Cancel information
    private Boolean cancelled;
    private String cancelReason;
    private LocalDateTime cancelledAt;
    private UUID cancelledByStaffId;
    private String cancelledByStaffName;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
