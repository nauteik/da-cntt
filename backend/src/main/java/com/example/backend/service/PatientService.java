package com.example.backend.service;

import com.example.backend.model.dto.PatientSummaryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service for patient management operations
 */
public interface PatientService {
    
    /**
     * Get paginated list of patient summaries
     * 
     * @param pageable pagination and sorting parameters
     * @return page of patient summary DTOs
     */
    Page<PatientSummaryDTO> getPatientSummaries(Pageable pageable);
}
