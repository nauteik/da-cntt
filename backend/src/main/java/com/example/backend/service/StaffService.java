package com.example.backend.service;

import com.example.backend.model.dto.StaffSelectDTO;

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
}

