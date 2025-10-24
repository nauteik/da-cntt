package com.example.backend.service;

import com.example.backend.model.dto.RoleDTO;

import java.util.List;

/**
 * Service interface for Role management
 */
public interface RoleService {
    
    /**
     * Get all active roles for select dropdown
     * 
     * @return list of active roles
     */
    List<RoleDTO> getActiveRoles();
}
