package com.example.backend.service;

import com.example.backend.model.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Service interface for House management
 */
public interface HouseService {

    /**
     * Get all houses with pagination, filtering, and search
     *
     * @param pageable pagination parameters
     * @param officeId optional office filter
     * @param search optional search term (code, name)
     * @return paginated list of houses
     */
    Page<HouseDTO> getAllHouses(Pageable pageable, UUID officeId, String search);

    /**
     * Get house by ID
     *
     * @param id house ID
     * @return house details
     */
    HouseDTO getHouseById(UUID id);

    /**
     * Create a new house
     *
     * @param request house creation request
     * @return created house details
     */
    HouseDTO createHouse(HouseCreateRequest request);

    /**
     * Update an existing house
     *
     * @param id house ID
     * @param request house update request
     * @return updated house details
     */
    HouseDTO updateHouse(UUID id, HouseUpdateRequest request);

    /**
     * Soft delete a house
     *
     * @param id house ID
     */
    void deleteHouse(UUID id);

    /**
     * Assign a patient to a house
     * Validates that patient has active authorization with residential care setting
     *
     * @param houseId house ID
     * @param request assignment request
     * @return created stay DTO
     */
    PatientHouseStayDTO assignPatientToHouse(UUID houseId, AssignPatientRequest request);

    /**
     * Unassign a patient from a house (set move out date)
     *
     * @param stayId stay ID
     * @param moveOutDate move out date
     * @return updated stay DTO
     */
    PatientHouseStayDTO unassignPatientFromHouse(UUID stayId, LocalDate moveOutDate);

    /**
     * Get all stays for a patient
     *
     * @param patientId patient ID
     * @return list of patient stays
     */
    List<PatientHouseStayDTO> getPatientStays(UUID patientId);

    /**
     * Get current patient staying in a house
     *
     * @param houseId house ID
     * @return current stay DTO or null if no active patient
     */
    PatientHouseStayDTO getHouseCurrentPatient(UUID houseId);
}





