package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for staff management
 */
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@Slf4j
public class StaffController {

    private final StaffService staffService;

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

