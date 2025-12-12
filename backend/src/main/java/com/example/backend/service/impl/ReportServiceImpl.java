package com.example.backend.service.impl;

import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.AuthorizationSearchRequestDTO;
import com.example.backend.model.dto.report.*;
import com.example.backend.repository.AuthorizationRepository;
import com.example.backend.service.AuthorizationService;
import com.example.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of ReportService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final AuthorizationRepository authorizationRepository;
    private final AuthorizationService authorizationService;

    @Override
    @Transactional(readOnly = true)
    public Page<AuthVsActualReportDTO> getAuthVsActualReport(ReportFilterDTO filters, Pageable pageable) {
        log.info("Generating Authorization vs Actual Used report with filters: fromDate={}, toDate={}, payers={}, programs={}, services={}",
            filters.getFromDate(), filters.getToDate(), 
            filters.getPayerIds() != null ? filters.getPayerIds().size() : 0,
            filters.getProgramIds() != null ? filters.getProgramIds().size() : 0,
            filters.getServiceTypeIds() != null ? filters.getServiceTypeIds().size() : 0);

        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();

        // Convert List to Array for PostgreSQL array parameters
        UUID[] payerIds = filters.getPayerIds() != null && !filters.getPayerIds().isEmpty() 
            ? filters.getPayerIds().toArray(new UUID[0]) : null;
        UUID[] programIds = filters.getProgramIds() != null && !filters.getProgramIds().isEmpty()
            ? filters.getProgramIds().toArray(new UUID[0]) : null;
        UUID[] serviceTypeIds = filters.getServiceTypeIds() != null && !filters.getServiceTypeIds().isEmpty()
            ? filters.getServiceTypeIds().toArray(new UUID[0]) : null;

        // Fetch results using projection
        List<AuthVsActualProjection> projections = authorizationRepository.findAuthVsActualReport(
            filters.getFromDate(),
            filters.getToDate(),
            payerIds,
            programIds,
            serviceTypeIds,
            filters.getClientMedicaidId(),
            filters.getClientSearch(),
            limit,
            offset
        );

        // Map to DTO
        List<AuthVsActualReportDTO> content = projections.stream()
            .map(proj -> new AuthVsActualReportDTO(
                proj.getClientName(),
                proj.getClientType(),
                proj.getMedicaidId(),
                proj.getAlternatePayer(),
                proj.getPayer(),
                proj.getProgram(),
                proj.getService(),
                proj.getAuthStartDate(),
                proj.getAuthEndDate(),
                proj.getAuthId(),
                proj.getAuthorizedUnits(),
                proj.getUsedUnits(),
                proj.getAvailableUnits(),
                proj.getLimitType(),
                proj.getJurisdiction()
            ))
            .collect(Collectors.toList());

        // Count total results
        long total = authorizationRepository.countAuthVsActualReport(
            filters.getFromDate(),
            filters.getToDate(),
            payerIds,
            programIds,
            serviceTypeIds,
            filters.getClientMedicaidId(),
            filters.getClientSearch()
        );

        log.info("Found {} authorization vs actual records out of {} total (page {}/{})",
            content.size(), total, pageable.getPageNumber() + 1, (int) Math.ceil((double) total / limit));

        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuthorizationSearchDTO> getAuthorizationsReport(ReportFilterDTO filters, Pageable pageable) {
        log.info("Generating Authorizations report with filters: fromDate={}, toDate={}",
            filters.getFromDate(), filters.getToDate());

        // Map ReportFilterDTO to AuthorizationSearchRequestDTO
        AuthorizationSearchRequestDTO searchRequest = new AuthorizationSearchRequestDTO();
        searchRequest.setStartDate(filters.getFromDate());
        searchRequest.setEndDate(filters.getToDate());
        
        // Set payer ID (first one if multiple selected)
        if (filters.getPayerIds() != null && !filters.getPayerIds().isEmpty()) {
            searchRequest.setPayerId(filters.getPayerIds().get(0));
        }
        
        // Set program ID (first one if multiple selected)
        if (filters.getProgramIds() != null && !filters.getProgramIds().isEmpty()) {
            searchRequest.setProgramId(filters.getProgramIds().get(0));
        }
        
        // Set service type ID (first one if multiple selected)
        if (filters.getServiceTypeIds() != null && !filters.getServiceTypeIds().isEmpty()) {
            searchRequest.setServiceTypeId(filters.getServiceTypeIds().get(0));
        }
        
        // Set client search parameters
        if (filters.getClientMedicaidId() != null && !filters.getClientMedicaidId().isEmpty()) {
            searchRequest.setClientId(filters.getClientMedicaidId());
        }
        
        if (filters.getClientSearch() != null && !filters.getClientSearch().isEmpty()) {
            String[] nameParts = filters.getClientSearch().split("\\s+", 2);
            searchRequest.setClientFirstName(nameParts[0]);
            if (nameParts.length > 1) {
                searchRequest.setClientLastName(nameParts[1]);
            }
        }

        // Use existing authorization service
        return authorizationService.searchAuthorizations(searchRequest, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClientsWithoutAuthReportDTO> getClientsWithoutAuthReport(ReportFilterDTO filters, Pageable pageable) {
        log.info("Generating Clients Without Authorizations report with filters: fromDate={}, toDate={}",
            filters.getFromDate(), filters.getToDate());

        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();

        // Fetch results using projection
        List<ClientsWithoutAuthProjection> projections = authorizationRepository.findClientsWithoutAuthReport(
            filters.getFromDate(),
            filters.getToDate(),
            filters.getClientMedicaidId(),
            filters.getClientSearch(),
            limit,
            offset
        );

        // Map to DTO
        List<ClientsWithoutAuthReportDTO> content = projections.stream()
            .map(proj -> new ClientsWithoutAuthReportDTO(
                proj.getClientName(),
                proj.getClientType(),
                proj.getMedicaidId(),
                proj.getAlternatePayer(),
                proj.getPayer(),
                proj.getProgram(),
                proj.getService(),
                proj.getSupervisor()
            ))
            .collect(Collectors.toList());

        // Count total results
        long total = authorizationRepository.countClientsWithoutAuthReport(
            filters.getFromDate(),
            filters.getToDate(),
            filters.getClientMedicaidId(),
            filters.getClientSearch()
        );

        log.info("Found {} clients without authorizations out of {} total (page {}/{})",
            content.size(), total, pageable.getPageNumber() + 1, (int) Math.ceil((double) total / limit));

        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ExpiringAuthReportDTO> getExpiringAuthReport(ReportFilterDTO filters, Pageable pageable) {
        log.info("Generating Expiring Authorizations report with filters: fromDate={}, toDate={}",
            filters.getFromDate(), filters.getToDate());

        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();

        // Convert List to Array for PostgreSQL array parameters
        UUID[] payerIds = filters.getPayerIds() != null && !filters.getPayerIds().isEmpty() 
            ? filters.getPayerIds().toArray(new UUID[0]) : null;
        UUID[] programIds = filters.getProgramIds() != null && !filters.getProgramIds().isEmpty()
            ? filters.getProgramIds().toArray(new UUID[0]) : null;
        UUID[] serviceTypeIds = filters.getServiceTypeIds() != null && !filters.getServiceTypeIds().isEmpty()
            ? filters.getServiceTypeIds().toArray(new UUID[0]) : null;

        // Fetch results using projection
        List<ExpiringAuthProjection> projections = authorizationRepository.findExpiringAuthReport(
            filters.getFromDate(),
            filters.getToDate(),
            payerIds,
            programIds,
            serviceTypeIds,
            filters.getClientMedicaidId(),
            filters.getClientSearch(),
            limit,
            offset
        );

        // Map to DTO
        List<ExpiringAuthReportDTO> content = projections.stream()
            .map(proj -> new ExpiringAuthReportDTO(
                proj.getClientName(),
                proj.getClientType(),
                proj.getMedicaidId(),
                proj.getAlternatePayer(),
                proj.getPayer(),
                proj.getProgram(),
                proj.getService(),
                proj.getStartDate(),
                proj.getEndDate(),
                proj.getAuthId(),
                proj.getAuthorizedUnits(),
                proj.getLimit(),
                proj.getAvailable(),
                proj.getJurisdiction(),
                proj.getDaysUntilExpiration()
            ))
            .collect(Collectors.toList());

        // Count total results
        long total = authorizationRepository.countExpiringAuthReport(
            filters.getFromDate(),
            filters.getToDate(),
            payerIds,
            programIds,
            serviceTypeIds,
            filters.getClientMedicaidId(),
            filters.getClientSearch()
        );

        log.info("Found {} expiring authorizations out of {} total (page {}/{})",
            content.size(), total, pageable.getPageNumber() + 1, (int) Math.ceil((double) total / limit));

        return new PageImpl<>(content, pageable, total);
    }
}

