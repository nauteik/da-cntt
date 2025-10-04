package com.example.backend.service;

import com.example.backend.model.dto.PatientSummaryDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service for patient management operations
 */
public interface PatientService {
    
    /**
     * Get paginated list of patient summaries with optional filtering
     * 
     * @param search optional search text to filter by client name, medicaid ID, or client payer ID
     * @param status optional list of patient statuses to filter by
     * @param pageable pagination and sorting parameters
     * @return page of patient summary DTOs
     */
    Page<PatientSummaryDTO> getPatientSummaries(String search, List<String> status, Pageable pageable);
}
