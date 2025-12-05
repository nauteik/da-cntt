package com.example.backend.model.dto.schedule;

import java.time.LocalDate;
import java.time.OffsetDateTime;
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
    private LocalDate eventDate;
    private OffsetDateTime startAt;
    private OffsetDateTime endAt;
    private String status;
    private Integer plannedUnits;
    private Double actualUnits;
    private String programIdentifier;
    private UUID employeeId;
    private String employeeName;
    private UUID supervisorId;
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
}


