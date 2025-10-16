package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.dto.PatientCreatedDTO;
import com.example.backend.model.dto.CreatePatientDTO;
import com.example.backend.model.dto.UpdatePatientIdentifiersDTO;
import com.example.backend.model.dto.UpdatePatientPersonalDTO;
import com.example.backend.model.dto.UpdatePatientAddressDTO;
import com.example.backend.model.dto.UpdatePatientContactDTO;
import com.example.backend.model.dto.PatientProgramDTO;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import jakarta.validation.Valid;
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
     * Create a new patient.
     * Requires ADMIN or MANAGER role.
     * 
     * @param createPatientDTO patient creation data
     * @param authentication authenticated user
     * @return created patient information
     * 
     * Example: POST /api/patients
     * Body: {
     *   "firstName": "John",
     *   "lastName": "Doe",
     *   "programIdentifier": "ODP",
     *   "payerIdentifier": "PAODP",
     *   "medicaidId": "M123456789",
     *   "phone": "555-1234" (optional)
     * }
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientCreatedDTO>> createPatient(
            @Valid @RequestBody CreatePatientDTO createPatientDTO,
            Authentication authentication) {
        
        String authenticatedUserEmail = authentication.getName();
        log.info("Creating patient. Initiated by: {}", authenticatedUserEmail);
        
        PatientCreatedDTO createdPatient = patientService.createPatient(
            createPatientDTO, 
            authenticatedUserEmail
        );
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(createdPatient, "Patient created successfully"));
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

    /**
     * Update patient identifiers.
     * Updates client ID, medicaid ID, SSN, and agency ID.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param updateDTO patient identifiers update data
     * @return updated patient header information
     * 
     * Example: PUT /api/patients/123e4567-e89b-12d3-a456-426614174000/identifiers
     * Body: {
     *   "clientId": "CL-123456",
     *   "medicaidId": "M123456789",
     *   "ssn": "123-45-6789",
     *   "agencyId": "AG-001"
     * }
     */
    @PatchMapping("/{id}/identifiers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientHeaderDTO>> updatePatientIdentifiers(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePatientIdentifiersDTO updateDTO) {
        
        log.info("Updating identifiers for patient ID: {}", id);
        
        PatientHeaderDTO updatedHeader = patientService.updatePatientIdentifiers(id, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedHeader, "Patient identifiers updated successfully")
        );
    }

    /**
     * Update patient personal information.
     * Updates first name, last name, date of birth, gender, and primary language.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param updateDTO patient personal information update data
     * @return updated patient personal information
     * 
     * Example: PATCH /api/patients/123e4567-e89b-12d3-a456-426614174000/personal
     * Body: {
     *   "firstName": "John",
     *   "lastName": "Doe",
     *   "dob": "1990-01-01",
     *   "gender": "Male",
     *   "primaryLanguage": "English"
     * }
     */
    @PatchMapping("/{id}/personal")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> updatePatientPersonal(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePatientPersonalDTO updateDTO) {
        
        log.info("Updating personal information for patient ID: {}", id);
        
        PatientPersonalDTO updatedPersonal = patientService.updatePatientPersonal(id, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Patient personal information updated successfully")
        );
    }

    /**
     * Create a new address for a patient.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param updateDTO address data
     * @return updated patient personal information
     * 
     * Example: POST /api/patients/123e4567-e89b-12d3-a456-426614174000/addresses
     * Body: {
     *   "label": "Home",
     *   "type": "HOME",
     *   "line1": "123 Main St",
     *   "line2": "Apt 4B",
     *   "city": "Philadelphia",
     *   "state": "PA",
     *   "postalCode": "19103",
     *   "county": "Philadelphia",
     *   "phone": "(215) 555-1234",
     *   "email": "john@example.com",
     *   "isMain": true
     * }
     */
    @PostMapping("/{id}/addresses")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> createPatientAddress(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePatientAddressDTO updateDTO) {
        
        log.info("Creating address for patient ID: {}", id);
        
        PatientPersonalDTO updatedPersonal = patientService.createPatientAddress(id, updateDTO);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(updatedPersonal, "Address created successfully"));
    }

    /**
     * Update an existing patient address.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param addressId address UUID (PatientAddress ID)
     * @param updateDTO address data to update
     * @return updated patient personal information
     * 
     * Example: PATCH /api/patients/123e4567-e89b-12d3-a456-426614174000/addresses/456e7890-e89b-12d3-a456-426614174001
     * Body: {
     *   "line1": "456 New St",
     *   "city": "Pittsburgh",
     *   "isMain": false
     * }
     */
    @PatchMapping("/{id}/addresses/{addressId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> updatePatientAddress(
            @PathVariable UUID id,
            @PathVariable UUID addressId,
            @Valid @RequestBody UpdatePatientAddressDTO updateDTO) {
        
        log.info("Updating address ID: {} for patient ID: {}", addressId, id);
        
        PatientPersonalDTO updatedPersonal = patientService.updatePatientAddress(id, addressId, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Address updated successfully")
        );
    }

    /**
     * Create a new emergency contact for a patient.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param updateDTO contact data
     * @return updated patient personal information
     * 
     * Example: POST /api/patients/123e4567-e89b-12d3-a456-426614174000/contacts
     * Body: {
     *   "relation": "Spouse",
     *   "name": "Jane Doe",
     *   "phone": "215-555-5678",
     *   "email": "jane@example.com",
     *   "isPrimary": true
     * }
     */
    @PostMapping("/{id}/contacts")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> createPatientContact(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePatientContactDTO updateDTO) {
        
        log.info("Creating contact for patient ID: {}", id);
        
        PatientPersonalDTO updatedPersonal = patientService.createPatientContact(id, updateDTO);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(updatedPersonal, "Contact created successfully"));
    }

    /**
     * Update an existing patient emergency contact.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param contactId contact UUID
     * @param updateDTO contact data to update
     * @return updated patient personal information
     * 
     * Example: PATCH /api/patients/123e4567-e89b-12d3-a456-426614174000/contacts/789e0123-e89b-12d3-a456-426614174002
     * Body: {
     *   "phone": "215-555-9999",
     *   "isPrimary": false
     * }
     */
    @PatchMapping("/{id}/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> updatePatientContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId,
            @Valid @RequestBody UpdatePatientContactDTO updateDTO) {
        
        log.info("Updating contact ID: {} for patient ID: {}", contactId, id);
        
        PatientPersonalDTO updatedPersonal = patientService.updatePatientContact(id, contactId, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Contact updated successfully")
        );
    }

    /**
     * Delete a patient address.
     * Also deletes the associated Address entity.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param addressId address UUID (PatientAddress ID)
     * @return updated patient personal information
     * 
     * Example: DELETE /api/patients/{id}/addresses/{addressId}
     */
    @DeleteMapping("/{id}/addresses/{addressId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> deletePatientAddress(
            @PathVariable UUID id,
            @PathVariable UUID addressId) {
        
        log.info("Deleting address ID: {} for patient ID: {}", addressId, id);
        
        PatientPersonalDTO updatedPersonal = patientService.deletePatientAddress(id, addressId);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Address deleted successfully")
        );
    }

    /**
     * Delete a patient emergency contact.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param contactId contact UUID
     * @return updated patient personal information
     * 
     * Example: DELETE /api/patients/{id}/contacts/{contactId}
     */
    @DeleteMapping("/{id}/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientPersonalDTO>> deletePatientContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId) {
        
        log.info("Deleting contact ID: {} for patient ID: {}", contactId, id);
        
        PatientPersonalDTO updatedPersonal = patientService.deletePatientContact(id, contactId);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Contact deleted successfully")
        );
    }

    /**
     * Get full Program tab data for a patient (historical).
     *
     * @param id patient UUID
     * @return aggregated program tab information
     *
     * Example: GET /api/patients/{id}/program
     */
    @GetMapping("/{id}/program")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> getPatientProgram(
            @PathVariable UUID id) {

        log.debug("GET /api/patients/{}/program", id);

        PatientProgramDTO program = patientService.getPatientProgram(id);

        return ResponseEntity.ok(
            ApiResponse.success(program, "Patient program data retrieved successfully")
        );
    }
}
