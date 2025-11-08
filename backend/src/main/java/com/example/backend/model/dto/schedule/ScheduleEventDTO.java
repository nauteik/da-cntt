package com.example.backend.model.dto.schedule;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.Data;

@Data
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
}


