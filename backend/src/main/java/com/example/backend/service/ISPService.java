package com.example.backend.service;

import com.example.backend.model.dto.CreateISPDTO;
import com.example.backend.model.dto.ISPResponseDTO;
import com.example.backend.model.dto.UpdateISPDTO;

import java.util.UUID;

/**
 * Service interface for ISP (Individual Service Plan) operations
 */
public interface ISPService {
    
    /**
     * Get the latest ISP for a patient
     * @param patientId Patient ID
     * @return ISPResponseDTO or null if no ISP exists
     */
    ISPResponseDTO getISPByPatientId(UUID patientId);
    
    /**
     * Create a new ISP for a patient
     * @param patientId Patient ID
     * @param dto Create ISP DTO
     * @return Created ISPResponseDTO
     */
    ISPResponseDTO createISP(UUID patientId, CreateISPDTO dto);
    
    /**
     * Update an existing ISP
     * @param ispId ISP ID
     * @param dto Update ISP DTO
     * @return Updated ISPResponseDTO
     */
    ISPResponseDTO updateISP(UUID ispId, UpdateISPDTO dto);
    
    /**
     * Delete an ISP
     * @param ispId ISP ID
     */
    void deleteISP(UUID ispId);
}
