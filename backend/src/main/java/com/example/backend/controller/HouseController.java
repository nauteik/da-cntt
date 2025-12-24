package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.*;
import com.example.backend.service.HouseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST Controller for house management
 */
@RestController
@RequestMapping("/api/house")
@RequiredArgsConstructor
@Slf4j
public class HouseController {

    private final HouseService houseService;

    /**
     * Get all houses with pagination, filtering, and search
     * GET /api/house?page=0&size=25&sortBy=code&sortDir=asc&officeId=...&search=...
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<Page<HouseDTO>>> getAllHouses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) UUID officeId,
            @RequestParam(required = false) String search) {
        log.info("Request to get houses - page={}, size={}, sortBy={}, sortDir={}, officeId={}, search={}",
                page, size, sortBy, sortDir, officeId, search);

        // Build pageable with sorting
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, sortBy);
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<HouseDTO> houses = houseService.getAllHouses(pageable, officeId, search);
        return ResponseEntity.ok(ApiResponse.success(houses));
    }

    /**
     * Get house by ID
     * GET /api/house/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<HouseDTO>> getHouseById(@PathVariable UUID id) {
        log.info("Request to get house by ID: {}", id);
        HouseDTO house = houseService.getHouseById(id);
        return ResponseEntity.ok(ApiResponse.success(house));
    }

    /**
     * Create a new house
     * POST /api/house
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<HouseDTO>> createHouse(
            @Valid @RequestBody HouseCreateRequest request) {
        log.info("Request to create new house with code: {}", request.getCode());
        HouseDTO house = houseService.createHouse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(house, "House created successfully"));
    }

    /**
     * Update an existing house
     * PUT /api/house/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<HouseDTO>> updateHouse(
            @PathVariable UUID id,
            @Valid @RequestBody HouseUpdateRequest request) {
        log.info("Request to update house with ID: {}", id);
        HouseDTO house = houseService.updateHouse(id, request);
        return ResponseEntity.ok(ApiResponse.success(house, "House updated successfully"));
    }

    /**
     * Soft delete a house
     * DELETE /api/house/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHouse(@PathVariable UUID id) {
        log.info("Request to delete house with ID: {}", id);
        houseService.deleteHouse(id);
        return ResponseEntity.ok(ApiResponse.success(null, "House deleted successfully"));
    }

    /**
     * Assign a patient to a house
     * POST /api/house/{id}/assign-patient
     */
    @PostMapping("/{id}/assign-patient")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientHouseStayDTO>> assignPatientToHouse(
            @PathVariable UUID id,
            @Valid @RequestBody AssignPatientRequest request) {
        log.info("Request to assign patient {} to house {}", request.getPatientId(), id);
        PatientHouseStayDTO stay = houseService.assignPatientToHouse(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(stay, "Patient assigned to house successfully"));
    }

    /**
     * Unassign a patient from a house
     * PUT /api/house/stay/{stayId}/unassign
     */
    @PutMapping("/stay/{stayId}/unassign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientHouseStayDTO>> unassignPatientFromHouse(
            @PathVariable UUID stayId,
            @Valid @RequestBody UnassignPatientRequest request) {
        log.info("Request to unassign patient from stay {}", stayId);
        PatientHouseStayDTO stay = houseService.unassignPatientFromHouse(stayId, request.getMoveOutDate());
        return ResponseEntity.ok(ApiResponse.success(stay, "Patient unassigned from house successfully"));
    }

    /**
     * Get all stays for a patient
     * GET /api/house/patient/{patientId}/stays
     */
    @GetMapping("/patient/{patientId}/stays")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<PatientHouseStayDTO>>> getPatientStays(
            @PathVariable UUID patientId) {
        log.info("Request to get stays for patient: {}", patientId);
        List<PatientHouseStayDTO> stays = houseService.getPatientStays(patientId);
        return ResponseEntity.ok(ApiResponse.success(stays));
    }

    /**
     * Get current patient staying in a house
     * GET /api/house/{id}/current-patient
     */
    @GetMapping("/{id}/current-patient")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<PatientHouseStayDTO>> getHouseCurrentPatient(
            @PathVariable UUID id) {
        log.info("Request to get current patient for house: {}", id);
        PatientHouseStayDTO stay = houseService.getHouseCurrentPatient(id);
        if (stay == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No active patient in this house"));
        }
        return ResponseEntity.ok(ApiResponse.success(stay));
    }
}

