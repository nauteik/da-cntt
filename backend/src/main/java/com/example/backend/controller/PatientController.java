package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.service.PatientService;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for patient management
 */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
@Validated // Enable method-level validation
public class PatientController {

    private final PatientService patientService;

    /**
     * Get paginated list of patient summaries.
     * Supports dynamic page sizes, sorting, searching, and status filtering.
     * 
     * @param page page number (0-indexed)
     * @param size page size (default 20, max 100)
     * @param sortBy field to sort by (optional)
     * @param sortDir sort direction (asc or desc, default: asc)
     * @param search optional search text to filter by client name, medicaid ID, or client payer ID
     * @param status optional list of patient statuses to filter by (ACTIVE, INACTIVE, PENDING)
     * @return paginated patient summaries
     * 
     * Example: GET /api/patients?page=0&size=50&sortBy=lastName&sortDir=asc&search=john&status=ACTIVE&status=PENDING
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientSummaryDTO>>> getPatients(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> status) {
                
        Page<PatientSummaryDTO> patients = patientService.getPatientSummaries(
            search, status, page, size, sortBy, sortDir
        );
        
        return ResponseEntity.ok(
            ApiResponse.success(patients, "Patients retrieved successfully")
        );
    }

    /**
     * Get patient header information by ID.
     * Returns common patient information displayed across all tabs.
     * 
     * @param id patient UUID
     * @return patient header information
     * 
     * Example: GET /api/patients/123e4567-e89b-12d3-a456-426614174000/header
     */
    @GetMapping("/{id}/header")
    public ResponseEntity<ApiResponse<PatientHeaderDTO>> getPatientHeader(
            @PathVariable UUID id) {
        
        log.debug("GET /api/patients/{}/header", id);
        
        PatientHeaderDTO header = patientService.getPatientHeader(id);
        
        return ResponseEntity.ok(
            ApiResponse.success(header, "Patient header retrieved successfully")
        );
    }

    /**
     * Get patient personal information by ID.
     * Returns detailed patient information including contacts and addresses.
     * 
     * @param id patient UUID
     * @return patient personal information
     * 
     * Example: GET /api/patients/123e4567-e89b-12d3-a456-426614174000/personal
     */
    @GetMapping("/{id}/personal")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> getPatientPersonal(
            @PathVariable UUID id) {
        
        log.debug("GET /api/patients/{}/personal", id);
        
        PatientPersonalDTO personal = patientService.getPatientPersonal(id);
        
        return ResponseEntity.ok(
            ApiResponse.success(personal, "Patient personal information retrieved successfully")
        );
    }
}
