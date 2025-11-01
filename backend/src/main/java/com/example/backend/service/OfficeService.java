package com.example.backend.service;

import java.util.List;
import java.util.UUID;

import com.example.backend.dto.OfficeCreateRequest;
import com.example.backend.dto.OfficeDetailResponse;
import com.example.backend.dto.OfficePatientDTO;
import com.example.backend.dto.OfficeStaffDTO;
import com.example.backend.dto.OfficeUpdateRequest;
import com.example.backend.model.dto.OfficeDTO;

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
    
    /**
     * Get all offices including inactive ones
     *
     * @return list of all offices
     */
    List<OfficeDTO> getAllOffices();
    
    /**
     * Get office details by ID
     *
     * @param id office ID
     * @return office details
     */
    OfficeDetailResponse getOfficeById(UUID id);
    
    /**
     * Get office details by code
     *
     * @param code office code
     * @return office details
     */
    OfficeDetailResponse getOfficeByCode(String code);
    
    /**
     * Create a new office
     *
     * @param request office creation request
     * @return created office details
     */
    OfficeDetailResponse createOffice(OfficeCreateRequest request);
    
    /**
     * Update an existing office
     *
     * @param id office ID
     * @param request office update request
     * @return updated office details
     */
    OfficeDetailResponse updateOffice(UUID id, OfficeUpdateRequest request);
    
    /**
     * Soft delete an office
     *
     * @param id office ID
     */
    void deleteOffice(UUID id);
    
    /**
     * Activate an office
     *
     * @param id office ID
     */
    void activateOffice(UUID id);
    
    /**
     * Deactivate an office
     *
     * @param id office ID
     */
    void deactivateOffice(UUID id);
    
    /**
     * Get all staff members of an office
     *
     * @param officeId office ID
     * @param activeOnly if true, return only active staff
     * @return list of staff
     */
    List<OfficeStaffDTO> getOfficeStaff(UUID officeId, Boolean activeOnly);
    
    /**
     * Get all patients of an office
     *
     * @param officeId office ID
     * @param activeOnly if true, return only active patients
     * @return list of patients
     */
    List<OfficePatientDTO> getOfficePatients(UUID officeId, Boolean activeOnly);
}
