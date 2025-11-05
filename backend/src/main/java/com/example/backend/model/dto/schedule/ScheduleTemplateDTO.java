package com.example.backend.model.dto.schedule;

import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class ScheduleTemplateDTO {
    private UUID id;
    private UUID patientId;
    private UUID officeId;
    private String name;
    private String description;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private LocalDate generatedThrough; // Last generation date
}

