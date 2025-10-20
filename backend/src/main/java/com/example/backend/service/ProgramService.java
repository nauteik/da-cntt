package com.example.backend.service;

import com.example.backend.model.dto.ProgramSelectDTO;

import java.util.List;

/**
 * Service interface for Program management
 */
public interface ProgramService {
    
    /**
     * Get all active programs for select dropdown
     * 
     * @return list of active programs
     */
    List<ProgramSelectDTO> getActiveProgramsForSelect();
}

