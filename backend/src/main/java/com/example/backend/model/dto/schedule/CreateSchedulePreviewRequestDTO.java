package com.example.backend.model.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for requesting a schedule creation preview with conflict detection.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSchedulePreviewRequestDTO {
    
    @NotNull(message = "Schedule event is required")
    @Valid
    private CreateScheduleEventDTO scheduleEvent;
    
    @Valid
    private RepeatConfigDTO repeatConfig; // Optional - if null, create single event
}


