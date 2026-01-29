package com.example.backend.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for schedule event statistics by date
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleEventStatsDTO {
    
    private LocalDate date;
    private Long planned;
    private Long confirmed;
    private Long inProgress;
    private Long completed;
    private Long cancelled;
    private Long total;
}
