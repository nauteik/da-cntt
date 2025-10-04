package com.example.backend.service.impl;

import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    public Page<PatientSummaryDTO> getPatientSummaries(String search, List<String> status, Pageable pageable) {
        log.debug("Fetching patient summaries with search: '{}', status: {}, page: {}, size: {}", 
            search, status, pageable.getPageNumber(), pageable.getPageSize());
        
        // Convert status list to comma-separated string for native query compatibility
        String statusFilter = (status != null && !status.isEmpty()) 
            ? String.join(",", status) 
            : null;
        
        // Extract sort information from Pageable
        String sortColumn = "first_name"; // default
        String sortDirection = "asc"; // default
        
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
        
        log.debug("Fetched {} patient summaries out of {} total", 
            content.size(), total);
        
        return patientPage;
    }
}
