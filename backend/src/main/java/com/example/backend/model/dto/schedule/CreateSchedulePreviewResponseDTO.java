package com.example.backend.model.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO for schedule creation preview response with conflict detection.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateSchedulePreviewResponseDTO {
    
    private List<ScheduleEventDTO> scheduleEvents = new ArrayList<>();
    
    private boolean canSave; // True if no conflicts or all conflicts resolved
    
    private String message; // Summary message about the preview
}


