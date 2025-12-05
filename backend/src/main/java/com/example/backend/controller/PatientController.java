package com.example.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.CreateAuthorizationDTO;
import com.example.backend.model.dto.CreatePatientDTO;
import com.example.backend.model.dto.CreatePatientPayerDTO;
import com.example.backend.model.dto.CreatePatientServiceDTO;
import com.example.backend.model.dto.PatientCreatedDTO;
import com.example.backend.model.dto.PatientFilterOptionsDTO;
import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientProgramDTO;
import com.example.backend.model.dto.PatientSearchResultDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.dto.PayerAuthorizationDTO;
import com.example.backend.model.dto.UpdateAuthorizationDTO;
import com.example.backend.model.dto.UpdatePatientAddressDTO;
import com.example.backend.model.dto.UpdatePatientAddressLocationDTO;
import com.example.backend.model.dto.UpdatePatientContactDTO;
import com.example.backend.model.dto.UpdatePatientIdentifiersDTO;
import com.example.backend.model.dto.UpdatePatientPayerDTO;
import com.example.backend.model.dto.UpdatePatientPersonalDTO;
import com.example.backend.model.dto.UpdatePatientProgramDTO;
import com.example.backend.model.dto.UpdatePatientServiceDTO;
import com.example.backend.model.dto.PatientSelectDTO;
import com.example.backend.service.PatientService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) List<String> program,
            @RequestParam(required = false) List<String> services) {
                
        Page<PatientSummaryDTO> patients = patientService.getPatientSummaries(
            search, status, program, services, page, size, sortBy, sortDir
        );
        
        return ResponseEntity.ok(
            ApiResponse.success(patients, "Patients retrieved successfully")
        );
    }

    /**
     * Get active patients for select dropdown.
     * Returns list of active patients with formatted display names.
     * 
     * @return list of active patient select DTOs
     * 
     * Example: GET /api/patients/select
     */
    @GetMapping("/select")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<PatientSelectDTO>>> getActivePatientsForSelect() {
        log.info("GET /api/patients/select - Fetching active patients for select");
        List<PatientSelectDTO> patientList = patientService.getActivePatientsForSelect();
        return ResponseEntity.ok(ApiResponse.success(patientList, "Active patients retrieved successfully"));
    }

    /**
     * Get available filter options for patients (programs and service types).
     * Returns distinct values from the database for use in frontend filters.
     * 
     * @return filter options containing available programs and service types
     * 
     * Example: GET /api/patients/filter-options
     */
    @GetMapping("/filter-options")
    public ResponseEntity<ApiResponse<PatientFilterOptionsDTO>> getPatientFilterOptions() {
        log.debug("GET /api/patients/filter-options - Fetching patient filter options");
        
        PatientFilterOptionsDTO filterOptions = patientService.getPatientFilterOptions();
        
        return ResponseEntity.ok(
            ApiResponse.success(filterOptions, "Patient filter options retrieved successfully")
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

    /**
     * Update patient program information.
     * Updates program enrollment details including supervisor, dates, and reason for change.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param updateDTO program update data
     * @return updated patient program information
     *
     * Example: PATCH /api/patients/123e4567-e89b-12d3-a456-426614174000/program
     * Body: {
     *   "programId": "550e8400-e29b-41d4-a716-446655440000",
     *   "supervisorId": "660e8400-e29b-41d4-a716-446655440001",
     *   "enrollmentDate": "2024-01-15",
     *   "statusEffectiveDate": "2024-01-15",
     *   "socDate": "2024-01-20",
     *   "eocDate": "2024-12-31",
     *   "eligibilityBeginDate": "2024-01-01",
     *   "eligibilityEndDate": "2024-12-31",
     *   "reasonForChange": {"reason": "Program transfer"}
     * }
     */
    @PatchMapping("/{id}/program")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> updatePatientProgram(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePatientProgramDTO updateDTO) {

        log.info("Updating program for patient ID: {}", id);

        PatientProgramDTO updatedProgram = patientService.updatePatientProgram(id, updateDTO);

        return ResponseEntity.ok(
            ApiResponse.success(updatedProgram, "Patient program updated successfully")
        );
    }

    /**
     * Create a new patient service assignment.
     * Assigns a service type to a patient with start/end dates.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param createDTO service creation data
     * @return updated patient program information
     *
     * Example: POST /api/patients/123e4567-e89b-12d3-a456-426614174000/services
     * Body: {
     *   "serviceTypeId": "550e8400-e29b-41d4-a716-446655440000",
     *   "startDate": "2024-01-15",
     *   "endDate": "2024-12-31"
     * }
     */
    @PostMapping("/{id}/services")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> createPatientService(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePatientServiceDTO createDTO) {

        log.info("Creating service for patient ID: {}", id);

        PatientProgramDTO updatedProgram = patientService.createPatientService(id, createDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(updatedProgram, "Patient service created successfully"));
    }

    /**
     * Update an existing patient service assignment.
     * Updates service type, dates, or metadata.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param serviceId patient service UUID
     * @param updateDTO service update data
     * @return updated patient program information
     *
     * Example: PATCH /api/patients/123e4567-e89b-12d3-a456-426614174000/services/550e8400-e29b-41d4-a716-446655440000
     * Body: {
     *   "startDate": "2024-02-01",
     *   "endDate": "2024-11-30"
     * }
     */
    @PatchMapping("/{id}/services/{serviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> updatePatientService(
            @PathVariable UUID id,
            @PathVariable UUID serviceId,
            @Valid @RequestBody UpdatePatientServiceDTO updateDTO) {

        log.info("Updating service ID: {} for patient ID: {}", serviceId, id);

        PatientProgramDTO updatedProgram = patientService.updatePatientService(id, serviceId, updateDTO);

        return ResponseEntity.ok(
            ApiResponse.success(updatedProgram, "Patient service updated successfully")
        );
    }

    /**
     * Delete a patient service assignment.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param serviceId patient service UUID
     * @return updated patient program information
     *
     * Example: DELETE /api/patients/123e4567-e89b-12d3-a456-426614174000/services/550e8400-e29b-41d4-a716-446655440000
     */
    @DeleteMapping("/{id}/services/{serviceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> deletePatientService(
            @PathVariable UUID id,
            @PathVariable UUID serviceId) {

        log.info("Deleting service ID: {} for patient ID: {}", serviceId, id);

        PatientProgramDTO updatedProgram = patientService.deletePatientService(id, serviceId);

        return ResponseEntity.ok(
            ApiResponse.success(updatedProgram, "Patient service deleted successfully")
        );
    }

    /**
     * Get authorizations for a specific patient payer.
     * Returns list of authorizations associated with the patient payer.
     * 
     * @param id patient UUID
     * @param patientPayerId patient payer UUID
     * @return list of authorization DTOs
     * 
     * Example: GET /api/patients/123e4567-e89b-12d3-a456-426614174000/payers/550e8400-e29b-41d4-a716-446655440000/authorizations
     */
    @GetMapping("/{id}/payers/{patientPayerId}/authorizations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<PayerAuthorizationDTO>>> getPatientPayerAuthorizations(
            @PathVariable UUID id,
            @PathVariable UUID patientPayerId) {

        log.info("Getting authorizations for patient payer ID: {} of patient ID: {}", patientPayerId, id);

        List<PayerAuthorizationDTO> authorizations = patientService.getPatientPayerAuthorizations(id, patientPayerId);

        return ResponseEntity.ok(
            ApiResponse.success(authorizations, "Patient payer authorizations retrieved successfully")
        );
    }

    /**
     * Create a new patient payer assignment.
     * Assigns a payer to a patient with rank, dates, and group number.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param createDTO payer creation data
     * @return updated patient program information
     *
     * Example: POST /api/patients/123e4567-e89b-12d3-a456-426614174000/payers
     * Body: {
     *   "payerId": "550e8400-e29b-41d4-a716-446655440000",
     *   "rank": 1,
     *   "groupNo": "GRP123",
     *   "startDate": "2024-01-15",
     *   "endDate": "2024-12-31"
     * }
     */
    @PostMapping("/{id}/payers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> createPatientPayer(
            @PathVariable UUID id,
            @Valid @RequestBody CreatePatientPayerDTO createDTO) {

        log.info("Creating payer for patient ID: {}", id);

        PatientProgramDTO updatedProgram = patientService.createPatientPayer(id, createDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(updatedProgram, "Patient payer created successfully"));
    }

    /**
     * Update an existing patient payer assignment.
     * Updates payer, rank, dates, or group number.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param patientPayerId patient payer UUID
     * @param updateDTO payer update data
     * @return updated patient program information
     *
     * Example: PATCH /api/patients/123e4567-e89b-12d3-a456-426614174000/payers/550e8400-e29b-41d4-a716-446655440000
     * Body: {
     *   "rank": 2,
     *   "endDate": "2024-11-30"
     * }
     */
    @PatchMapping("/{id}/payers/{patientPayerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> updatePatientPayer(
            @PathVariable UUID id,
            @PathVariable UUID patientPayerId,
            @Valid @RequestBody UpdatePatientPayerDTO updateDTO) {

        log.info("Updating payer ID: {} for patient ID: {}", patientPayerId, id);

        PatientProgramDTO updatedProgram = patientService.updatePatientPayer(id, patientPayerId, updateDTO);

        return ResponseEntity.ok(
            ApiResponse.success(updatedProgram, "Patient payer updated successfully")
        );
    }

    /**
     * Create a new authorization.
     * Links a patient service and patient payer with authorization details.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param createDTO authorization creation data
     * @return updated patient program information
     *
     * Example: POST /api/patients/123e4567-e89b-12d3-a456-426614174000/authorizations
     * Body: {
     *   "patientServiceId": "550e8400-e29b-41d4-a716-446655440000",
     *   "patientPayerId": "660e8400-e29b-41d4-a716-446655440001",
     *   "authorizationNo": "AUTH123456",
     *   "eventCode": "U1-ECS",
     *   "format": "units",
     *   "maxUnits": 100,
     *   "startDate": "2024-01-15",
     *   "endDate": "2024-12-31",
     *   "comments": "Initial authorization"
     * }
     */
    @PostMapping("/{id}/authorizations")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> createAuthorization(
            @PathVariable UUID id,
            @Valid @RequestBody CreateAuthorizationDTO createDTO) {

        log.info("Creating authorization for patient ID: {}", id);

        PatientProgramDTO updatedProgram = patientService.createAuthorization(id, createDTO);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(updatedProgram, "Authorization created successfully"));
    }

    /**
     * Update an existing authorization.
     * Updates authorization details including service, payer, dates, and limits.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param authorizationId authorization UUID
     * @param updateDTO authorization update data
     * @return updated patient program information
     *
     * Example: PATCH /api/patients/123e4567-e89b-12d3-a456-426614174000/authorizations/550e8400-e29b-41d4-a716-446655440000
     * Body: {
     *   "maxUnits": 120,
     *   "endDate": "2025-06-30"
     * }
     */
    @PatchMapping("/{id}/authorizations/{authorizationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> updateAuthorization(
            @PathVariable UUID id,
            @PathVariable UUID authorizationId,
            @Valid @RequestBody UpdateAuthorizationDTO updateDTO) {

        log.info("Updating authorization ID: {} for patient ID: {}", authorizationId, id);

        PatientProgramDTO updatedProgram = patientService.updateAuthorization(id, authorizationId, updateDTO);

        return ResponseEntity.ok(
            ApiResponse.success(updatedProgram, "Authorization updated successfully")
        );
    }

    /**
     * Delete an authorization.
     * Requires ADMIN or MANAGER role.
     *
     * @param id patient UUID
     * @param authorizationId authorization UUID
     * @return updated patient program information
     *
     * Example: DELETE /api/patients/123e4567-e89b-12d3-a456-426614174000/authorizations/550e8400-e29b-41d4-a716-446655440000
     */
    @DeleteMapping("/{id}/authorizations/{authorizationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientProgramDTO>> deleteAuthorization(
            @PathVariable UUID id,
            @PathVariable UUID authorizationId) {

        log.info("Deleting authorization ID: {} for patient ID: {}", authorizationId, id);

        PatientProgramDTO updatedProgram = patientService.deleteAuthorization(id, authorizationId);

        return ResponseEntity.ok(
            ApiResponse.success(updatedProgram, "Authorization deleted successfully")
        );
    }

    /**
     * Search patients by name (first name or last name).
     * Returns patients with their main address information.
     * 
     * @param name search string for first name or last name (case-insensitive, partial match)
     * @return list of matching patients with address info
     * 
     * Example: GET /api/patients/search?name=john
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PatientSearchResultDTO>>> searchPatientsByName(
            @RequestParam String name) {
        
        log.info("Searching patients by name: {}", name);
        
        List<PatientSearchResultDTO> patients = patientService.searchPatientsByName(name);
        
        return ResponseEntity.ok(
            ApiResponse.success(patients, "Found " + patients.size() + " patient(s)")
        );
    }

    /**
     * Update patient main address with GPS location.
     * Updates or creates the main address for a patient including GPS coordinates.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id patient UUID
     * @param updateDTO address update data with GPS coordinates
     * @return updated patient search result with new address
     * 
     * Example: PATCH /api/patients/{id}/address/location
     * Body: {
     *   "line1": "123 Main St",
     *   "city": "Philadelphia",
     *   "state": "PA",
     *   "postalCode": "19103",
     *   "latitude": 39.952583,
     *   "longitude": -75.165222,
     *   "phone": "(215) 555-1234",
     *   "email": "john@example.com",
     *   "locationNotes": "Apartment 3B, blue door"
     * }
     */
    @PatchMapping("/{id}/address/location")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<PatientSearchResultDTO>> updatePatientAddressWithLocation(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePatientAddressLocationDTO updateDTO) {
        
        log.info("Updating address with GPS location for patient ID: {}", id);
        
        PatientSearchResultDTO updatedPatient = patientService.updatePatientAddressWithLocation(id, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPatient, "Patient address updated successfully")
        );
    }
}
