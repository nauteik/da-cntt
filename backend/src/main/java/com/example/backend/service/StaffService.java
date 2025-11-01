package com.example.backend.service;

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
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for Staff management
 */
public interface StaffService {
    
    /**
     * Get all active staff for select dropdown
     * 
     * @return list of active staff with formatted display names
     */
    List<StaffSelectDTO> getActiveStaffForSelect();
    
    /**
     * Get paginated list of staff summaries with optional filtering and sorting.
     * Validates sort parameters and constructs pagination internally.
     * 
     * @param search optional search text to filter by name or employee ID
     * @param status optional list of staff statuses to filter by
     * @param role optional list of role names to filter by
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy field to sort by (optional, validated against whitelist)
     * @param sortDir sort direction (asc or desc)
     * @return page of staff summary DTOs
     * @throws com.example.backend.exception.InvalidSortFieldException if sortBy is not in whitelist
     * @throws IllegalArgumentException if sortDir is invalid
     */
    Page<StaffSummaryDTO> getStaffSummaries(
        String search, 
        List<String> status, 
        List<String> role,
        int page, 
        int size, 
        String sortBy, 
        String sortDir
    );

    /**
     * Create a new staff member with associated user account.
     * Creates both Staff entity and AppUser account with hashed password.
     * 
     * @param createStaffDTO staff creation data
     * @param authenticatedUserEmail email of the authenticated user
     * @return created staff DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if office not found
     * @throws com.example.backend.exception.ConflictException if email or SSN already exists
     */
    StaffCreatedDTO createStaff(CreateStaffDTO createStaffDTO, String authenticatedUserEmail);

    /**
     * Get staff header information by staff ID
     * 
     * @param staffId UUID of the staff member
     * @return staff header DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if staff not found
     */
    StaffHeaderDTO getStaffHeader(UUID staffId);

    /**
     * Get staff personal information by staff ID
     * 
     * @param staffId UUID of the staff member
     * @return staff personal DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if staff not found
     */
    StaffPersonalDTO getStaffPersonal(UUID staffId);

    /**
     * Update staff identifiers.
     * Updates SSN, employee ID, and national provider ID.
     * 
     * @param staffId UUID of the staff member
     * @param updateDTO staff identifiers update data
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff not found
     */
    StaffPersonalDTO updateStaffIdentifiers(UUID staffId, UpdateStaffIdentifiersDTO updateDTO);

    /**
     * Update staff personal information.
     * Updates first name, last name, date of birth, gender, primary language, and supervisor status.
     * 
     * @param staffId UUID of the staff member
     * @param updateDTO staff personal information update data
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff not found
     */
    StaffPersonalDTO updateStaffPersonal(UUID staffId, UpdateStaffPersonalDTO updateDTO);

    /**
     * Create a new address for a staff member.
     * 
     * @param staffId UUID of the staff member
     * @param updateDTO address data
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff not found
     */
    StaffPersonalDTO createStaffAddress(UUID staffId, UpdateStaffAddressDTO updateDTO);

    /**
     * Update an existing staff address.
     * 
     * @param staffId UUID of the staff member
     * @param addressId address UUID (StaffAddress ID)
     * @param updateDTO address data to update
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff or address not found
     */
    StaffPersonalDTO updateStaffAddress(UUID staffId, UUID addressId, UpdateStaffAddressDTO updateDTO);

    /**
     * Delete a staff address.
     * Also deletes the associated Address entity.
     * 
     * @param staffId UUID of the staff member
     * @param addressId address UUID (StaffAddress ID)
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff or address not found
     */
    StaffPersonalDTO deleteStaffAddress(UUID staffId, UUID addressId);

    /**
     * Create a new emergency contact for a staff member.
     * 
     * @param staffId UUID of the staff member
     * @param updateDTO contact data
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff not found
     */
    StaffPersonalDTO createStaffContact(UUID staffId, UpdateStaffContactDTO updateDTO);

    /**
     * Update an existing staff emergency contact.
     * 
     * @param staffId UUID of the staff member
     * @param contactId contact UUID
     * @param updateDTO contact data to update
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff or contact not found
     */
    StaffPersonalDTO updateStaffContact(UUID staffId, UUID contactId, UpdateStaffContactDTO updateDTO);

    /**
     * Delete a staff emergency contact.
     * 
     * @param staffId UUID of the staff member
     * @param contactId contact UUID
     * @return updated staff personal information
     * @throws com.example.backend.exception.ResourceNotFoundException if staff or contact not found
     */
    StaffPersonalDTO deleteStaffContact(UUID staffId, UUID contactId);
}

