package com.example.backend.service;

import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.report.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for report operations
 */
public interface ReportService {
    
    /**
     * Get Authorization vs Actual Used by Client report
     * 
     * @param filters report filter parameters
     * @param pageable pagination and sorting information
     * @return page of report results
     */
    Page<AuthVsActualReportDTO> getAuthVsActualReport(ReportFilterDTO filters, Pageable pageable);
    
    /**
     * Get Authorizations report (reuses existing authorization search)
     * 
     * @param filters report filter parameters
     * @param pageable pagination and sorting information
     * @return page of report results
     */
    Page<AuthorizationSearchDTO> getAuthorizationsReport(ReportFilterDTO filters, Pageable pageable);
    
    /**
     * Get Clients Without Authorizations report
     * 
     * @param filters report filter parameters
     * @param pageable pagination and sorting information
     * @return page of report results
     */
    Page<ClientsWithoutAuthReportDTO> getClientsWithoutAuthReport(ReportFilterDTO filters, Pageable pageable);
    
    /**
     * Get Expiring Authorizations report
     * 
     * @param filters report filter parameters
     * @param pageable pagination and sorting information
     * @return page of report results
     */
    Page<ExpiringAuthReportDTO> getExpiringAuthReport(ReportFilterDTO filters, Pageable pageable);
}

