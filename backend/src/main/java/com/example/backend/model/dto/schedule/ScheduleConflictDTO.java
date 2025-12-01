package com.example.backend.model.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

/**
 * DTO representing a schedule conflict.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleConflictDTO {
    
    private String conflictType; // PATIENT_CONFLICT, STAFF_CONFLICT
    
    private UUID conflictingEventId;
    
    private LocalDate eventDate;
    
    private LocalTime startTime;
    
    private LocalTime endTime;
    
    private String message; // Human-readable conflict description
    
    private String conflictingWithName; // Name of conflicting patient/staff
    
    private boolean resolved; // Whether the conflict has been resolved (e.g., by override)
}


