package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.StaffSummaryDTO;
import com.example.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import java.util.List;

/**
 * REST Controller for staff management
 */
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@Slf4j
@Validated // Enable method-level validation
public class StaffController {

    private final StaffService staffService;

    /**
     * Get paginated list of staff summaries.
     * Supports dynamic page sizes, sorting, searching, and status filtering.
     * 
     * @param page page number (0-indexed)
     * @param size page size (default 20, max 100)
     * @param sortBy field to sort by (optional)
     * @param sortDir sort direction (asc or desc, default: asc)
     * @param search optional search text to filter by name or employee ID
     * @param status optional list of staff statuses to filter by (ACTIVE, INACTIVE)
     * @return paginated staff summaries
     * 
     * Example: GET /api/staff?page=0&size=50&sortBy=name&sortDir=asc&search=john&status=ACTIVE
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<StaffSummaryDTO>>> getStaff(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> status) {
                
        Page<StaffSummaryDTO> staff = staffService.getStaffSummaries(
            search, status, page, size, sortBy, sortDir
        );
        
        return ResponseEntity.ok(
            ApiResponse.success(staff, "Staff retrieved successfully")
        );
    }

    /**
     * Get active staff for select dropdown
     * 
     * @return list of active staff with formatted display names
     * 
     * Example: GET /api/staff/select
     */
    @GetMapping("/select")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<StaffSelectDTO>>> getActiveStaffForSelect() {
        log.info("GET /api/staff/select - Fetching active staff for select");
        List<StaffSelectDTO> staffList = staffService.getActiveStaffForSelect();
        return ResponseEntity.ok(ApiResponse.success(staffList, "Active staff retrieved successfully"));
    }
}

