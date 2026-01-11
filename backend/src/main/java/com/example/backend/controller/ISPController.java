package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.CreateISPDTO;
import com.example.backend.model.dto.ISPResponseDTO;
import com.example.backend.model.dto.UpdateISPDTO;
import com.example.backend.service.ISPService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for ISP (Individual Service Plan) operations
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ISPController {

    private final ISPService ispService;

    /**
     * Get ISP for a patient
     * GET /api/patients/{patientId}/isp
     */
    @GetMapping("/patients/{patientId}/isp")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'DSP')")
    public ResponseEntity<ApiResponse<ISPResponseDTO>> getISP(@PathVariable UUID patientId) {
        try {
            ISPResponseDTO isp = ispService.getISPByPatientId(patientId);
            if (isp == null) {
                return ResponseEntity.ok(ApiResponse.success(null, "No ISP found for this patient"));
            }
            return ResponseEntity.ok(ApiResponse.success(isp, "ISP retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving ISP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Failed to retrieve ISP: " + e.getMessage()));
        }
    }

    /**
     * Create a new ISP for a patient
     * POST /api/patients/{patientId}/isp
     */
    @PostMapping("/patients/{patientId}/isp")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<ISPResponseDTO>> createISP(
            @PathVariable UUID patientId,
            @Valid @RequestBody CreateISPDTO dto) {
        try {
            log.info("Creating ISP for patient: {}", patientId);
            ISPResponseDTO createdISP = ispService.createISP(patientId, dto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(createdISP, "ISP created successfully"));
        } catch (Exception e) {
            log.error("Error creating ISP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to create ISP: " + e.getMessage()));
        }
    }

    /**
     * Update an existing ISP
     * PUT /api/isp/{ispId}
     */
    @PutMapping("/isp/{ispId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<ISPResponseDTO>> updateISP(
            @PathVariable UUID ispId,
            @Valid @RequestBody UpdateISPDTO dto) {
        try {
            log.info("Updating ISP: {}", ispId);
            ISPResponseDTO updatedISP = ispService.updateISP(ispId, dto);
            return ResponseEntity.ok(ApiResponse.success(updatedISP, "ISP updated successfully"));
        } catch (Exception e) {
            log.error("Error updating ISP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to update ISP: " + e.getMessage()));
        }
    }

    /**
     * Delete an ISP
     * DELETE /api/isp/{ispId}
     */
    @DeleteMapping("/isp/{ispId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteISP(@PathVariable UUID ispId) {
        try {
            log.info("Deleting ISP: {}", ispId);
            ispService.deleteISP(ispId);
            return ResponseEntity.ok(ApiResponse.success("ISP deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting ISP: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Failed to delete ISP: " + e.getMessage()));
        }
    }
}
