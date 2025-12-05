package com.example.backend.model.dto.schedule;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for configuring repeat schedule events.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepeatConfigDTO {
    
    @NotNull(message = "Interval is required")
    @Min(value = 1, message = "Interval must be at least 1")
    private Integer interval; // e.g., 1, 2, 3
    
    @NotNull(message = "Frequency is required")
    private String frequency; // "WEEK" or "MONTH"
    
    private List<Integer> daysOfWeek; // 0=Sunday, 1=Monday, ..., 6=Saturday (for weekly repeat)
    
    // End condition: either endDate or occurrences
    private LocalDate endDate; // Repeat until this date
    
    private Integer occurrences; // Or repeat for X occurrences
}


