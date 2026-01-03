package com.example.backend.model.dto.schedule;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleEventDTO {
    private UUID id;
    private UUID patientId;
    private String patientName; // For display in staff context
    private String patientClientId; // For display in staff context
    private String patientAddress; // Full address string for display
    private String patientCity;
    private String patientState;
    private String patientZipCode;
    private LocalDate eventDate;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private String status;
    private Integer plannedUnits;
    private Double actualUnits;
    private String programIdentifier;
    private UUID employeeId;
    private String employeeName;
    // Client supervisor (from Patient)
    private UUID clientSupervisorId;
    private String clientSupervisorName;
    // Employee supervisor (from Staff)
    private UUID employeeSupervisorId;
    private String employeeSupervisorName;
    // Deprecated: kept for backward compatibility, use clientSupervisorId/clientSupervisorName instead
    @Deprecated
    private UUID supervisorId;
    @Deprecated
    private String supervisorName;
    private UUID authorizationId; // Required for creating Service Delivery
    private UUID serviceDeliveryId; // Current Service Delivery (if exists)
    private String serviceDeliveryStatus; // Service Delivery status (PENDING, IN_PROGRESS, COMPLETED)
    private String serviceCode;
    private String eventCode;
    private OffsetDateTime checkInTime;
    private OffsetDateTime checkOutTime;
    private UUID dailyNoteId; // Daily Note ID if exists (indicates daily note completed)
    
    // Additional fields for Edit form
    private OffsetDateTime actualStartAt; // Read-only in form
    private OffsetDateTime actualEndAt; // Read-only in form
    private String comments; // Comments from comment field
    
    // Conflict information (for preview)
    private Boolean hasConflict = false;
    private List<String> conflictMessages = new ArrayList<>();
    
    // Staff replacement (unscheduled visit) fields
    private Boolean isReplaced = false; // True if this schedule has been replaced by another staff
    private UUID replacementStaffId; // ID of the replacement staff (actualStaff in service delivery)
    private String replacementStaffName; // Name of the replacement staff
    private String replacementReason; // Reason for staff replacement
}


