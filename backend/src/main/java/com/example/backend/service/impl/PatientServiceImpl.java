package com.example.backend.service.impl;

import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of PatientService
 * Uses optimized database-level aggregation for efficient pagination
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements com.example.backend.service.PatientService {

    private final PatientRepository patientRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PatientSummaryDTO> getPatientSummaries(Pageable pageable) {
        log.debug("Fetching patient summaries with page: {}, size: {}", 
            pageable.getPageNumber(), pageable.getPageSize());
        
        // Single optimized query with database-level aggregation
        // Benefits:
        // - No N+1 query problem
        // - Efficient for any page size (25, 50, 100, etc.)
        // - PostgreSQL array_agg handles service aggregation at database level
        // - LATERAL joins ensure we get only the latest program and primary payer
        Page<PatientSummaryDTO> patientPage = patientRepository.findPatientSummaries(pageable);
        
        log.debug("Fetched {} patient summaries out of {} total", 
            patientPage.getNumberOfElements(), patientPage.getTotalElements());
        
        return patientPage;
    }
}
