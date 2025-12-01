package com.example.backend.model.dto.schedule;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating multiple schedule events at once (after preview confirmation).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateScheduleBatchRequestDTO {
    
    @NotEmpty(message = "At least one schedule event is required")
    @Valid
    private List<CreateScheduleEventDTO> scheduleEvents;
}


