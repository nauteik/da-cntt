package com.example.backend.service;

import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.StaffSummaryDTO;
import com.example.backend.model.dto.CreateStaffDTO;
import com.example.backend.model.dto.StaffCreatedDTO;
import org.springframework.data.domain.Page;

import java.util.List;

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
}

