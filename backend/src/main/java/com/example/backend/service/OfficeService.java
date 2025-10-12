package com.example.backend.service;

import com.example.backend.model.dto.OfficeDTO;

import java.util.List;

/**
 * Service interface for Office management
 */
public interface OfficeService {
    
    /**
     * Get all active offices
     * 
     * @return list of active offices
     */
    List<OfficeDTO> getActiveOffices();
    
}
