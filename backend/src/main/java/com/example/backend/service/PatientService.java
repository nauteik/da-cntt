package com.example.backend.service;

import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

/**
 * Service for patient management operations
 */
public interface PatientService {
    
    /**
     * Get paginated list of patient summaries with optional filtering and sorting.
     * Validates sort parameters and constructs pagination internally.
     * 
     * @param search optional search text to filter by client name, medicaid ID, or client payer ID
     * @param status optional list of patient statuses to filter by
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy field to sort by (optional, validated against whitelist)
     * @param sortDir sort direction (asc or desc)
     * @return page of patient summary DTOs
     * @throws com.example.backend.exception.InvalidSortFieldException if sortBy is not in whitelist
     * @throws IllegalArgumentException if sortDir is invalid
     */
    Page<PatientSummaryDTO> getPatientSummaries(
        String search, 
        List<String> status, 
        int page, 
        int size, 
        String sortBy, 
        String sortDir
    );
    
    /**
     * Get patient header information by ID.
     * Used to display common patient information across all tabs.
     * 
     * @param patientId UUID of the patient
     * @return patient header DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient not found
     */
    PatientHeaderDTO getPatientHeader(UUID patientId);
    
    /**
     * Get patient personal information by ID.
     * Includes patient details, contacts, and addresses.
     * 
     * @param patientId UUID of the patient
     * @return patient personal DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient not found
     */
    PatientPersonalDTO getPatientPersonal(UUID patientId);
}
