package com.example.backend.model.dto.schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * DTO for creating a single schedule event.
 * Used in preview and final save operations.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateScheduleEventDTO {
    
    @NotNull(message = "Patient ID is required")
    private UUID patientId;
    
    @NotNull(message = "Event date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate eventDate;
    
    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    @NotNull(message = "Authorization ID is required")
    private UUID authorizationId;
    
    private UUID staffId; // Optional - can be assigned later
    
    private String eventCode;
    
    @NotNull(message = "Status is required")
    private String status; // PLANNED, CONFIRMED, etc.
    
    @NotNull(message = "Planned units is required")
    private Integer plannedUnits;
    
    private String comments;
}


