package com.example.backend.service;

import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.dto.PatientCreatedDTO;
import com.example.backend.model.dto.CreatePatientDTO;
import com.example.backend.model.dto.UpdatePatientIdentifiersDTO;
import com.example.backend.model.dto.UpdatePatientPersonalDTO;
import com.example.backend.model.dto.UpdatePatientAddressDTO;
import com.example.backend.model.dto.UpdatePatientContactDTO;
import com.example.backend.model.dto.PatientProgramDTO;
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

    /**
     * Create a new address for a patient.
     * Always creates a new Address entity (no sharing between patients).
     * 
     * @param patientId UUID of the patient
     * @param updateDTO address data
     * @return updated patient personal DTO with new address
     * @throws com.example.backend.exception.ResourceNotFoundException if patient not found
     * @throws IllegalArgumentException if required fields are missing
     */
    PatientPersonalDTO createPatientAddress(UUID patientId, UpdatePatientAddressDTO updateDTO);

    /**
     * Update an existing patient address.
     * Updates the Address entity directly (safe since not shared).
     * 
     * @param patientId UUID of the patient
     * @param addressId UUID of the PatientAddress to update
     * @param updateDTO address data to update
     * @return updated patient personal DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient or address not found
     */
    PatientPersonalDTO updatePatientAddress(UUID patientId, UUID addressId, UpdatePatientAddressDTO updateDTO);

    /**
     * Create a new emergency contact for a patient.
     * 
     * @param patientId UUID of the patient
     * @param updateDTO contact data
     * @return updated patient personal DTO with new contact
     * @throws com.example.backend.exception.ResourceNotFoundException if patient not found
     * @throws IllegalArgumentException if required fields are missing
     */
    PatientPersonalDTO createPatientContact(UUID patientId, UpdatePatientContactDTO updateDTO);

    /**
     * Update an existing patient emergency contact.
     * 
     * @param patientId UUID of the patient
     * @param contactId UUID of the PatientContact to update
     * @param updateDTO contact data to update
     * @return updated patient personal DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient or contact not found
     */
    PatientPersonalDTO updatePatientContact(UUID patientId, UUID contactId, UpdatePatientContactDTO updateDTO);

    /**
     * Delete a patient address and its associated Address entity.
     * Auto-promotes first remaining address as main if deleted address was main.
     * 
     * @param patientId UUID of the patient
     * @param addressId UUID of the PatientAddress to delete
     * @return updated patient personal DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient or address not found
     */
    PatientPersonalDTO deletePatientAddress(UUID patientId, UUID addressId);

    /**
     * Delete a patient emergency contact.
     * Auto-promotes first remaining contact as primary if deleted contact was primary.
     * 
     * @param patientId UUID of the patient
     * @param contactId UUID of the PatientContact to delete
     * @return updated patient personal DTO
     * @throws com.example.backend.exception.ResourceNotFoundException if patient or contact not found
     */
    PatientPersonalDTO deletePatientContact(UUID patientId, UUID contactId);

    /**
     * Get full historical Program tab data for a patient, including
     * programs, payers, services, and authorizations.
     *
     * @param patientId UUID of the patient
     * @return aggregated program tab DTO
     */
    PatientProgramDTO getPatientProgram(UUID patientId);
}
