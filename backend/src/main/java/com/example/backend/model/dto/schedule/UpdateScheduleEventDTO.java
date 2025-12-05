package com.example.backend.model.dto.schedule;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO for updating a schedule event.
 * All fields are optional except status, allowing partial updates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateScheduleEventDTO {
    
    private UUID authorizationId;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate eventDate;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    
    private UUID staffId;
    
    private String eventCode;
    
    @NotNull(message = "Status is required")
    private String status; // PLANNED, CONFIRMED, etc.
    
    private Integer plannedUnits;
    
    // Actual times and units are read-only in the form, but included in DTO for completeness
    // These should not be updated via the Edit form
    private Integer actualUnits;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime actualStartAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ssXXX")
    private OffsetDateTime actualEndAt;
    
    private String comments;
}

