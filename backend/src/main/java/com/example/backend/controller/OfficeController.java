package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.dto.OfficeCreateRequest;
import com.example.backend.model.dto.OfficeDetailResponse;
import com.example.backend.model.dto.OfficePatientDTO;
import com.example.backend.model.dto.OfficeStaffDTO;
import com.example.backend.model.dto.OfficeUpdateRequest;
import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.OfficeDTO;
import com.example.backend.service.OfficeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for office management
 */
@RestController
@RequestMapping("/api/office")
@RequiredArgsConstructor
@Slf4j
public class OfficeController {

    private final OfficeService officeService;

    /**
     * Get all offices (including inactive)
     * GET /api/office
     */
    @GetMapping
    // @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<OfficeDTO>>> getAllOffices() {
        log.info("Request to get all offices");
        List<OfficeDTO> offices = officeService.getAllOffices();
        return ResponseEntity.ok(ApiResponse.success(offices));
    }

    /**
     * Get active offices only
     * GET /api/office/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<OfficeDTO>>> getActiveOffices() {
        log.info("Request to get active offices");
        List<OfficeDTO> offices = officeService.getActiveOffices();
        return ResponseEntity.ok(ApiResponse.success(offices));
    }

    /**
     * Get office by ID with full details
     * GET /api/office/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<OfficeDetailResponse>> getOfficeById(@PathVariable UUID id) {
        log.info("Request to get office by ID: {}", id);
        OfficeDetailResponse office = officeService.getOfficeById(id);
        return ResponseEntity.ok(ApiResponse.success(office));
    }

    /**
     * Get office by code
     * GET /api/office/code/{code}
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<OfficeDetailResponse>> getOfficeByCode(@PathVariable String code) {
        log.info("Request to get office by code: {}", code);
        OfficeDetailResponse office = officeService.getOfficeByCode(code);
        return ResponseEntity.ok(ApiResponse.success(office));
    }

    /**
     * Create a new office
     * POST /api/office
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OfficeDetailResponse>> createOffice(
            @Valid @RequestBody OfficeCreateRequest request) {
        log.info("Request to create new office with code: {}", request.getCode());
        OfficeDetailResponse office = officeService.createOffice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(office, "Office created successfully"));
    }

    /**
     * Update an existing office
     * PUT /api/office/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<OfficeDetailResponse>> updateOffice(
            @PathVariable UUID id,
            @Valid @RequestBody OfficeUpdateRequest request) {
        log.info("Request to update office with ID: {}", id);
        OfficeDetailResponse office = officeService.updateOffice(id, request);
        return ResponseEntity.ok(ApiResponse.success(office, "Office updated successfully"));
    }

    /**
     * Soft delete an office
     * DELETE /api/office/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteOffice(@PathVariable UUID id) {
        log.info("Request to delete office with ID: {}", id);
        officeService.deleteOffice(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Office deleted successfully"));
    }

    /**
     * Activate an office
     * PUT /api/office/{id}/activate
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateOffice(@PathVariable UUID id) {
        log.info("Request to activate office with ID: {}", id);
        officeService.activateOffice(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Office activated successfully"));
    }

    /**
     * Deactivate an office
     * PUT /api/office/{id}/deactivate
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateOffice(@PathVariable UUID id) {
        log.info("Request to deactivate office with ID: {}", id);
        officeService.deactivateOffice(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Office deactivated successfully"));
    }

    /**
     * Get all staff members of an office
     * GET /api/office/{id}/staff?activeOnly=true
     */
    @GetMapping("/{id}/staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<OfficeStaffDTO>>> getOfficeStaff(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly) {
        log.info("Request to get staff for office ID: {}, activeOnly: {}", id, activeOnly);
        List<OfficeStaffDTO> staff = officeService.getOfficeStaff(id, activeOnly);
        return ResponseEntity.ok(ApiResponse.success(staff));
    }

    /**
     * Get all patients of an office
     * GET /api/office/{id}/patients?activeOnly=true
     */
    @GetMapping("/{id}/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<OfficePatientDTO>>> getOfficePatients(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly) {
        log.info("Request to get patients for office ID: {}, activeOnly: {}", id, activeOnly);
        List<OfficePatientDTO> patients = officeService.getOfficePatients(id, activeOnly);
        return ResponseEntity.ok(ApiResponse.success(patients));
    }
}
