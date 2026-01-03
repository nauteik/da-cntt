package com.example.backend.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.backend.model.enums.TaskStatus;

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
    private String patientAddress; // Full address string for display
    private String patientCity;
    private String patientState;
    private String patientZipCode;
    private UUID staffId;
    private String staffName;

    // Service delivery info
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer units;
    
    /**
     * Task status based on check-in/check-out:
     * - NOT_STARTED: Shift scheduled but check-in not yet done
     * - IN_PROGRESS: Check-in done, check-out not yet done (shift ongoing)
     * - COMPLETED: Both check-in and check-out done (shift finished)
     * - INCOMPLETE: Check-in done but check-out missed (time has passed)
     */
    private TaskStatus taskStatus;
    private String status; // For backward compatibility (string representation)
    private String approvalStatus;
    private Double totalHours;

    // Check-in/check-out summary
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private Boolean isCheckInCheckOutCompleted;
    private Boolean isCheckInCheckOutFullyValid;

    // Daily note summary
    private UUID dailyNoteId; // Daily Note ID if exists (indicates daily note completed)

    // Cancel information
    private Boolean cancelled;
    private String cancelReason;
    private LocalDateTime cancelledAt;
    private UUID cancelledByStaffId;
    private String cancelledByStaffName;

    // Unscheduled visit (staff replacement) information
    private Boolean isUnscheduled;
    private UUID actualStaffId;
    private String actualStaffName;
    private UUID scheduledStaffId;
    private String scheduledStaffName;
    private String unscheduledReason;

    // Metadata
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
