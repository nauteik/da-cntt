package com.example.backend.model.dto.schedule;

import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ScheduleEventDTO {
    private UUID id;
    private UUID patientId;
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
    private String serviceCode;
    private String eventCode;
    private OffsetDateTime checkInTime;
    private OffsetDateTime checkOutTime;
}


