package com.example.backend.service;

import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.dto.PatientCreatedDTO;
import com.example.backend.model.dto.CreatePatientDTO;
import com.example.backend.model.dto.UpdatePatientIdentifiersDTO;
import com.example.backend.model.dto.UpdatePatientPersonalDTO;
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

    /**
     * Create a new patient.
     * Validates that program and payer exist and are active.
     * Assigns patient to office (from DTO or authenticated user's office).
     * 
     * @param createPatientDTO patient creation data
     * @param authenticatedUserEmail email of the authenticated user
     * @return created patient DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if program, payer, or office not found
     * @throws IllegalArgumentException if program or payer is not active
     * @throws com.example.backend.exception.ConflictException if medicaid ID already exists
     */
    PatientCreatedDTO createPatient(CreatePatientDTO createPatientDTO, String authenticatedUserEmail);

    /**
     * Update patient identifiers.
     * Updates client ID, medicaid ID, SSN, and agency ID.
     * 
     * @param patientId UUID of the patient to update
     * @param updateDTO patient identifiers update data
     * @return updated patient header DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient not found
     * @throws com.example.backend.exception.ConflictException if medicaid ID or client ID already exists for another patient
     */
    PatientHeaderDTO updatePatientIdentifiers(UUID patientId, UpdatePatientIdentifiersDTO updateDTO);

    /**
     * Update patient personal information.
     * Updates first name, last name, date of birth, gender, and primary language.
     * 
     * @param patientId UUID of the patient to update
     * @param updateDTO patient personal information update data
     * @return updated patient personal DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient not found
     */
    PatientPersonalDTO updatePatientPersonal(UUID patientId, UpdatePatientPersonalDTO updateDTO);
}
