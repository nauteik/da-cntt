package com.example.backend.model.dto.schedule;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;

/**
 * DTO for updating a single template event.
 * All fields are optional to allow partial updates.
 */
@Data
public class UpdateTemplateEventDTO {
    
    @Min(0)
    @Max(6)
    private Short dayOfWeek; // 0=Sun..6=Sat
    
    private LocalTime startTime;
    
    private LocalTime endTime;
    
    private UUID authorizationId;
    
    @Size(max = 32)
    private String eventCode;
    
    @Min(0)
    @Max(24 * 60)
    private Integer plannedUnits;
    
    private UUID staffId;
    
    @Size(max = 2000)
    private String comment;
}

