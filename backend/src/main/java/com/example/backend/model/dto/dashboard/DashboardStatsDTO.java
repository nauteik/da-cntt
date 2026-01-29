package com.example.backend.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for dashboard overview statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    
    // Overview Statistics
    private Long totalPatients;
    private Long activePatients;
    private Long totalStaff;
    private Long activeStaff;
    
    // Schedule Event Statistics (for selected date range)
    private Long totalScheduleEvents;
    private Long plannedEvents;
    private Long confirmedEvents;
    private Long inProgressEvents;
    private Long completedEvents;
    private Long cancelledEvents;
    
    // Service Delivery Statistics (for selected date range)
    private Long totalServiceDeliveries;
    private Long notStartedDeliveries;
    private Long inProgressDeliveries;
    private Long completedDeliveries;
    private Long incompleteDeliveries;
    private Long cancelledDeliveries;
}
