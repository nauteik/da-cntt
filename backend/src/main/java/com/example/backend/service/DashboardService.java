package com.example.backend.service;

import com.example.backend.model.dto.dashboard.AlertDTO;
import com.example.backend.model.dto.dashboard.DashboardStatsDTO;
import com.example.backend.model.dto.dashboard.RecentActivityDTO;
import com.example.backend.model.dto.dashboard.ScheduleEventStatsDTO;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for dashboard statistics and data
 */
public interface DashboardService {
    
    /**
     * Get overall dashboard statistics for a date range
     * 
     * @param fromDate Start date for statistics
     * @param toDate End date for statistics
     * @param officeId Optional office filter (null for all offices)
     * @return Dashboard statistics
     */
    DashboardStatsDTO getDashboardStats(LocalDate fromDate, LocalDate toDate, UUID officeId);
    
    /**
     * Get schedule event statistics grouped by date
     * 
     * @param fromDate Start date
     * @param toDate End date
     * @param groupBy Grouping: "day", "week", "month"
     * @return List of schedule event statistics by date
     */
    List<ScheduleEventStatsDTO> getScheduleEventStats(LocalDate fromDate, LocalDate toDate, String groupBy);
    
    /**
     * Get recent activities (check-ins, check-outs, schedule events)
     * 
     * @param fromDateTime Start datetime for activities
     * @param page Page number
     * @param size Page size
     * @return Page of recent activities
     */
    Page<RecentActivityDTO> getRecentActivities(LocalDateTime fromDateTime, int page, int size);
    
    /**
     * Get dashboard alerts (expiring authorizations, incomplete shifts, etc.)
     * 
     * @param officeId Optional office filter (null for all offices)
     * @return List of alerts
     */
    List<AlertDTO> getAlerts(UUID officeId);
}
