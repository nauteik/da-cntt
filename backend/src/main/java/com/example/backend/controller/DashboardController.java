package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.dashboard.AlertDTO;
import com.example.backend.model.dto.dashboard.DashboardStatsDTO;
import com.example.backend.model.dto.dashboard.RecentActivityDTO;
import com.example.backend.model.dto.dashboard.ScheduleEventStatsDTO;
import com.example.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for dashboard data and statistics
 */
@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get overall dashboard statistics
     * 
     * @param fromDate Start date for statistics
     * @param toDate End date for statistics
     * @param officeId Optional office filter
     * @return Dashboard statistics
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) UUID officeId
    ) {
        log.info("GET /api/dashboard/stats - fromDate: {}, toDate: {}, officeId: {}", 
            fromDate, toDate, officeId);

        try {
            DashboardStatsDTO stats = dashboardService.getDashboardStats(fromDate, toDate, officeId);
            return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics fetched successfully"));
        } catch (Exception e) {
            log.error("Error fetching dashboard stats", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fetch dashboard statistics: " + e.getMessage()));
        }
    }

    /**
     * Get schedule event statistics grouped by date
     * 
     * @param fromDate Start date
     * @param toDate End date
     * @param groupBy Grouping: "day", "week", "month"
     * @return List of schedule event statistics
     */
    @GetMapping("/schedule-stats")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<List<ScheduleEventStatsDTO>>> getScheduleStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "day") String groupBy
    ) {
        log.info("GET /api/dashboard/schedule-stats - fromDate: {}, toDate: {}, groupBy: {}", 
            fromDate, toDate, groupBy);

        try {
            List<ScheduleEventStatsDTO> stats = dashboardService.getScheduleEventStats(
                fromDate, toDate, groupBy);
            return ResponseEntity.ok(ApiResponse.success(stats, 
                "Schedule event statistics fetched successfully"));
        } catch (Exception e) {
            log.error("Error fetching schedule stats", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fetch schedule statistics: " + e.getMessage()));
        }
    }

    /**
     * Get recent activities (check-ins, check-outs, schedule events)
     * 
     * @param hoursAgo How many hours back to fetch activities (default: 24)
     * @param page Page number
     * @param size Page size
     * @return Page of recent activities
     */
    @GetMapping("/recent-activities")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<Page<RecentActivityDTO>>> getRecentActivities(
            @RequestParam(defaultValue = "24") int hoursAgo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.info("GET /api/dashboard/recent-activities - hoursAgo: {}, page: {}, size: {}", 
            hoursAgo, page, size);

        try {
            LocalDateTime fromDateTime = LocalDateTime.now().minusHours(hoursAgo);
            Page<RecentActivityDTO> activities = dashboardService.getRecentActivities(
                fromDateTime, page, size);
            return ResponseEntity.ok(ApiResponse.success(activities, 
                "Recent activities fetched successfully"));
        } catch (Exception e) {
            log.error("Error fetching recent activities", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fetch recent activities: " + e.getMessage()));
        }
    }

    /**
     * Get dashboard alerts (expiring authorizations, incomplete shifts, etc.)
     * 
     * @param officeId Optional office filter
     * @return List of alerts
     */
    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<List<AlertDTO>>> getAlerts(
            @RequestParam(required = false) UUID officeId
    ) {
        log.info("GET /api/dashboard/alerts - officeId: {}", officeId);

        try {
            List<AlertDTO> alerts = dashboardService.getAlerts(officeId);
            return ResponseEntity.ok(ApiResponse.success(alerts, 
                "Dashboard alerts fetched successfully"));
        } catch (Exception e) {
            log.error("Error fetching alerts", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fetch alerts: " + e.getMessage()));
        }
    }
}
