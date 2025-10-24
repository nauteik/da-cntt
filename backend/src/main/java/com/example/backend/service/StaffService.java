package com.example.backend.service;

import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.StaffSummaryDTO;
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
        int page, 
        int size, 
        String sortBy, 
        String sortDir
    );
}

