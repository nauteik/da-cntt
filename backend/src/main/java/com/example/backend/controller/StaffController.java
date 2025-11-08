package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.StaffSummaryDTO;
import com.example.backend.model.dto.StaffHeaderDTO;
import com.example.backend.model.dto.StaffPersonalDTO;
import com.example.backend.model.dto.CreateStaffDTO;
import com.example.backend.model.dto.StaffCreatedDTO;
import com.example.backend.model.dto.UpdateStaffIdentifiersDTO;
import com.example.backend.model.dto.UpdateStaffPersonalDTO;
import com.example.backend.model.dto.UpdateStaffAddressDTO;
import com.example.backend.model.dto.UpdateStaffContactDTO;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
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

    /**
     * Get staff personal information by staff ID
     * 
     * @param id UUID of the staff member
     * @return staff personal information
     * 
     * Example: GET /api/staff/{id}/personal
     */
    @GetMapping("/{id}/personal")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> getStaffPersonal(
            @PathVariable UUID id) {
        
        log.debug("GET /api/staff/{}/personal", id);
        
        StaffPersonalDTO personal = staffService.getStaffPersonal(id);
        
        return ResponseEntity.ok(
            ApiResponse.success(personal, "Staff personal information retrieved successfully")
        );
    }

    /**
     * Update staff identifiers.
     * Updates SSN, employee ID, and national provider ID.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param updateDTO staff identifiers update data
     * @return updated staff personal information
     * 
     * Example: PATCH /api/staff/123e4567-e89b-12d3-a456-426614174000/identifiers
     * Body: {
     *   "ssn": "123-45-6789",
     *   "employeeId": "EMP-001",
     *   "nationalProviderId": "NPI123456"
     * }
     */
    @PatchMapping("/{id}/identifiers")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> updateStaffIdentifiers(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStaffIdentifiersDTO updateDTO) {
        
        log.info("Updating identifiers for staff ID: {}", id);
        
        StaffPersonalDTO updatedPersonal = staffService.updateStaffIdentifiers(id, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Staff identifiers updated successfully")
        );
    }

    /**
     * Update staff personal information.
     * Updates first name, last name, date of birth, gender, primary language, and supervisor status.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param updateDTO staff personal information update data
     * @return updated staff personal information
     * 
     * Example: PATCH /api/staff/123e4567-e89b-12d3-a456-426614174000/personal
     * Body: {
     *   "firstName": "John",
     *   "lastName": "Doe",
     *   "dob": "1990-01-01",
     *   "gender": "Male",
     *   "primaryLanguage": "English",
     *   "isSupervisor": true
     * }
     */
    @PatchMapping("/{id}/personal")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> updateStaffPersonal(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStaffPersonalDTO updateDTO) {
        
        log.info("Updating personal information for staff ID: {}", id);
        
        StaffPersonalDTO updatedPersonal = staffService.updateStaffPersonal(id, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Staff personal information updated successfully")
        );
    }

    /**
     * Create a new address for a staff member.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param updateDTO address data
     * @return updated staff personal information
     * 
     * Example: POST /api/staff/123e4567-e89b-12d3-a456-426614174000/addresses
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
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> createStaffAddress(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStaffAddressDTO updateDTO) {
        
        log.info("Creating address for staff ID: {}", id);
        
        StaffPersonalDTO updatedPersonal = staffService.createStaffAddress(id, updateDTO);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(updatedPersonal, "Address created successfully"));
    }

    /**
     * Update an existing staff address.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param addressId address UUID (StaffAddress ID)
     * @param updateDTO address data to update
     * @return updated staff personal information
     * 
     * Example: PATCH /api/staff/123e4567-e89b-12d3-a456-426614174000/addresses/456e7890-e89b-12d3-a456-426614174001
     * Body: {
     *   "line1": "456 New St",
     *   "city": "Pittsburgh",
     *   "isMain": false
     * }
     */
    @PatchMapping("/{id}/addresses/{addressId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> updateStaffAddress(
            @PathVariable UUID id,
            @PathVariable UUID addressId,
            @Valid @RequestBody UpdateStaffAddressDTO updateDTO) {
        
        log.info("Updating address ID: {} for staff ID: {}", addressId, id);
        
        StaffPersonalDTO updatedPersonal = staffService.updateStaffAddress(id, addressId, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Address updated successfully")
        );
    }

    /**
     * Delete a staff address.
     * Also deletes the associated Address entity.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param addressId address UUID (StaffAddress ID)
     * @return updated staff personal information
     * 
     * Example: DELETE /api/staff/{id}/addresses/{addressId}
     */
    @DeleteMapping("/{id}/addresses/{addressId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> deleteStaffAddress(
            @PathVariable UUID id,
            @PathVariable UUID addressId) {
        
        log.info("Deleting address ID: {} for staff ID: {}", addressId, id);
        
        StaffPersonalDTO updatedPersonal = staffService.deleteStaffAddress(id, addressId);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Address deleted successfully")
        );
    }

    /**
     * Create a new emergency contact for a staff member.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param updateDTO contact data
     * @return updated staff personal information
     * 
     * Example: POST /api/staff/123e4567-e89b-12d3-a456-426614174000/contacts
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
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> createStaffContact(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStaffContactDTO updateDTO) {
        
        log.info("Creating contact for staff ID: {}", id);
        
        StaffPersonalDTO updatedPersonal = staffService.createStaffContact(id, updateDTO);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(updatedPersonal, "Contact created successfully"));
    }

    /**
     * Update an existing staff emergency contact.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param contactId contact UUID
     * @param updateDTO contact data to update
     * @return updated staff personal information
     * 
     * Example: PATCH /api/staff/123e4567-e89b-12d3-a456-426614174000/contacts/789e0123-e89b-12d3-a456-426614174002
     * Body: {
     *   "phone": "215-555-9999",
     *   "isPrimary": false
     * }
     */
    @PatchMapping("/{id}/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> updateStaffContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId,
            @Valid @RequestBody UpdateStaffContactDTO updateDTO) {
        
        log.info("Updating contact ID: {} for staff ID: {}", contactId, id);
        
        StaffPersonalDTO updatedPersonal = staffService.updateStaffContact(id, contactId, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Contact updated successfully")
        );
    }

    /**
     * Delete a staff emergency contact.
     * Requires ADMIN or MANAGER role.
     * 
     * @param id staff UUID
     * @param contactId contact UUID
     * @return updated staff personal information
     * 
     * Example: DELETE /api/staff/{id}/contacts/{contactId}
     */
    @DeleteMapping("/{id}/contacts/{contactId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<StaffPersonalDTO>> deleteStaffContact(
            @PathVariable UUID id,
            @PathVariable UUID contactId) {
        
        log.info("Deleting contact ID: {} for staff ID: {}", contactId, id);
        
        StaffPersonalDTO updatedPersonal = staffService.deleteStaffContact(id, contactId);
        
        return ResponseEntity.ok(
            ApiResponse.success(updatedPersonal, "Contact deleted successfully")
        );
    }
}

