package com.example.backend.service.impl;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.dto.AddressDTO;
import com.example.backend.model.dto.ContactDTO;
import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.entity.Patient;
import com.example.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of PatientService
 * Uses optimized database-level aggregation for efficient pagination
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements com.example.backend.service.PatientService {

    private final PatientRepository patientRepository;
    
    // Whitelist of allowed sort fields to prevent SQL injection via sort parameter
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
        "clientName", "firstName", "lastName", "status", "medicaidId",
        "asOf", "soc", "eoc", "first_name", "last_name", "medicaid_id",
        "as_of", "soc_date", "eoc_date"
    );
    
    private static final Set<String> ALLOWED_SORT_DIRECTIONS = Set.of("asc", "desc");

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public Page<PatientSummaryDTO> getPatientSummaries(
            String search, 
            List<String> status, 
            int page, 
            int size, 
            String sortBy, 
            String sortDir) {
        
        // Validate sortBy against whitelist to prevent SQL injection
        if (sortBy != null && !sortBy.isEmpty() && !ALLOWED_SORT_FIELDS.contains(sortBy)) {
            log.warn("Invalid sort field requested: {}", sortBy);
            throw new com.example.backend.exception.InvalidSortFieldException(sortBy, ALLOWED_SORT_FIELDS);
        }
        
        // Validate sortDir
        if (sortDir != null && !ALLOWED_SORT_DIRECTIONS.contains(sortDir.toLowerCase())) {
            log.warn("Invalid sort direction requested: {}", sortDir);
            throw new IllegalArgumentException("Invalid sort direction: '" + sortDir + "'. Use 'asc' or 'desc'");
        }
        
        // Create pageable with or without sort
        Pageable pageable;
        if (sortBy != null && !sortBy.isEmpty()) {
            // Create Sort object only if sortBy is provided
            org.springframework.data.domain.Sort.Direction direction = 
                sortDir.equalsIgnoreCase("desc") 
                    ? org.springframework.data.domain.Sort.Direction.DESC 
                    : org.springframework.data.domain.Sort.Direction.ASC;
            org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(direction, sortBy);
            pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
        } else {
            // No sorting - return data in natural order
            pageable = org.springframework.data.domain.PageRequest.of(page, size);
        }
        
        return getPatientSummaries(search, status, pageable);
    }
    
    /**
     * Internal method to fetch patient summaries with pre-constructed Pageable.
     * Kept for backwards compatibility and internal use.
     */
    private Page<PatientSummaryDTO> getPatientSummaries(String search, List<String> status, Pageable pageable) {
        long startTime = System.currentTimeMillis();
        
        log.debug("Fetching patient summaries with search: '{}', status: {}, page: {}, size: {}", 
            search, status, pageable.getPageNumber(), pageable.getPageSize());
        
        // Convert status list to comma-separated string for native query compatibility
        String statusFilter = (status != null && !status.isEmpty()) 
            ? String.join(",", status) 
            : null;
        
        // Extract sort information from Pageable
        // No default sorting - only sort if user explicitly requests it
        String sortColumn = null;
        String sortDirection = "asc";
        
        if (pageable.getSort().isSorted()) {
            org.springframework.data.domain.Sort.Order order = pageable.getSort().iterator().next();
            sortColumn = order.getProperty();
            sortDirection = order.getDirection().isAscending() ? "asc" : "desc";
        }
        
        // Calculate limit and offset for manual pagination
        int limit = pageable.getPageSize();
        int offset = pageable.getPageNumber() * pageable.getPageSize();
        
        // Fetch data and count separately
        List<PatientSummaryDTO> content = patientRepository.findPatientSummariesList(
            search, 
            statusFilter, 
            sortColumn,
            sortDirection,
            limit,
            offset
        );
        
        long total = patientRepository.countPatientSummaries(search, statusFilter);
        
        // Manually construct Page object
        Page<PatientSummaryDTO> patientPage = new PageImpl<>(content, pageable, total);
        
        long duration = System.currentTimeMillis() - startTime;
        log.info("Fetched {} patients out of {} total in {}ms (page {}/{})", 
            content.size(), total, duration, pageable.getPageNumber() + 1, patientPage.getTotalPages());
        
        return patientPage;
    }

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public PatientHeaderDTO getPatientHeader(UUID patientId) {
        log.debug("Fetching patient header for patient ID: {}", patientId);
        
        PatientHeaderDTO header = patientRepository.findPatientHeaderById(patientId);
        
        if (header == null) {
            log.warn("Patient header not found for ID: {}", patientId);
            throw new ResourceNotFoundException("Patient", patientId);
        }
        
        log.debug("Successfully fetched patient header for ID: {}", patientId);
        return header;
    }

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public PatientPersonalDTO getPatientPersonal(UUID patientId) {
        log.debug("Fetching patient personal information for patient ID: {}", patientId);
        
        Patient patient = patientRepository.findPatientPersonalById(patientId);
        
        if (patient == null) {
            log.warn("Patient not found for ID: {}", patientId);
            throw new ResourceNotFoundException("Patient", patientId);
        }
        
        // Map entity to DTO
        PatientPersonalDTO dto = new PatientPersonalDTO();
        dto.setId(patient.getId());
        dto.setMedicaidId(patient.getMedicaidId());
        dto.setClientId(patient.getClientId());
        dto.setAgencyId(patient.getAgencyId());
        dto.setSsn(patient.getSsn());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setDob(patient.getDob());
        dto.setGender(patient.getGender());
        dto.setPrimaryLanguage(patient.getPrimaryLanguage());
        dto.setMedicalProfile(patient.getMedicalProfile());
        
        // Map contacts
        List<ContactDTO> contacts = patient.getContacts().stream()
            .map(contact -> {
                ContactDTO contactDTO = new ContactDTO();
                contactDTO.setId(contact.getId());
                contactDTO.setRelation(contact.getRelation());
                contactDTO.setName(contact.getName());
                contactDTO.setPhone(contact.getPhone());
                contactDTO.setEmail(contact.getEmail());
                contactDTO.setPrimary(contact.getIsPrimary());
                return contactDTO;
            })
            .collect(Collectors.toList());
        dto.setContacts(contacts);
        
        // Map addresses
        List<AddressDTO> addresses = patient.getPatientAddresses().stream()
            .map(patientAddress -> {
                AddressDTO addressDTO = new AddressDTO();
                addressDTO.setId(patientAddress.getId());
                if (patientAddress.getAddress() != null) {
                    addressDTO.setLine1(patientAddress.getAddress().getLine1());
                    addressDTO.setLine2(patientAddress.getAddress().getLine2());
                    addressDTO.setCity(patientAddress.getAddress().getCity());
                    addressDTO.setState(patientAddress.getAddress().getState());
                    addressDTO.setPostalCode(patientAddress.getAddress().getPostalCode());
                    addressDTO.setCountry(patientAddress.getAddress().getCountry());
                }
                addressDTO.setPhone(patientAddress.getPhone());
                addressDTO.setMain(patientAddress.getIsMain());
                return addressDTO;
            })
            .collect(Collectors.toList());
        dto.setAddresses(addresses);
        
        log.debug("Successfully fetched patient personal information for ID: {}", patientId);
        return dto;
    }
}
