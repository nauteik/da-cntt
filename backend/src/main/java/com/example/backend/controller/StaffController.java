package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.StaffSummaryDTO;
import com.example.backend.model.dto.StaffHeaderDTO;
import com.example.backend.model.dto.CreateStaffDTO;
import com.example.backend.model.dto.StaffCreatedDTO;
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
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

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
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<String> role) {
                
        Page<StaffSummaryDTO> staff = staffService.getStaffSummaries(
            search, status, role, page, size, sortBy, sortDir
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

    /**
     * Create a new staff member with associated user account.
     * Requires ADMIN or MANAGER role.
     * 
     * @param createStaffDTO staff creation data
     * @param authentication authenticated user
     * @return created staff information
     * 
     * Example: POST /api/staff
     * Body: {
     *   "firstName": "John",
     *   "lastName": "Doe",
     *   "officeId": "123e4567-e89b-12d3-a456-426614174000",
     *   "ssn": "123-45-6789",
     *   "phone": "555-1234",
     *   "email": "john.doe@example.com"
     * }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffCreatedDTO>> createStaff(
            @Valid @RequestBody CreateStaffDTO createStaffDTO,
            Authentication authentication) {
        
        String authenticatedUserEmail = authentication.getName();
        log.info("Creating staff member. Initiated by: {}", authenticatedUserEmail);
        
        StaffCreatedDTO createdStaff = staffService.createStaff(
            createStaffDTO, 
            authenticatedUserEmail
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdStaff, "Staff member created successfully"));
    }

    /**
     * Get staff header information by staff ID
     * 
     * @param id UUID of the staff member
     * @return staff header information
     * 
     * Example: GET /api/staff/{id}/header
     */
    @GetMapping("/{id}/header")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffHeaderDTO>> getStaffHeader(
            @PathVariable UUID id) {
        
        log.debug("GET /api/staff/{}/header", id);
        
        StaffHeaderDTO header = staffService.getStaffHeader(id);
        
        return ResponseEntity.ok(
            ApiResponse.success(header, "Staff header retrieved successfully")
        );
    }
}

