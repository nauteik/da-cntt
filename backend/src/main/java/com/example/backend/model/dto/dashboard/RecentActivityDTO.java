package com.example.backend.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for recent activities (check-ins, check-outs, schedule events)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentActivityDTO {
    
    private String id;
    
    /**
     * Activity type: CHECK_IN, CHECK_OUT, SCHEDULE_CREATED, SCHEDULE_UPDATED
     */
    private String type;
    
    private LocalDateTime time;
    private String description;
    private String staffName;
    private String patientName;
    
    /**
     * Activity status: success, warning, error, info
     */
    private String status;
}
