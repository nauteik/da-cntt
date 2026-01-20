package com.example.backend.service;

import com.example.backend.model.dto.report.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Service interface for daily report operations
 */
public interface DailyReportService {
    
    /**
     * Get Active Client Contacts report
     */
    Page<ActiveClientContactDTO> getActiveClientContacts(
        String clientMedicaidId,
        String clientSearch,
        LocalDate fromDate,
        LocalDate toDate,
        List<UUID> payerIds,
        List<UUID> programIds,
        UUID supervisorId,
        Pageable pageable
    );
    
    /**
     * Get Active Clients report
     */
    Page<ActiveClientDTO> getActiveClients(
        String clientMedicaidId,
        String clientSearch,
        LocalDate fromDate,
        LocalDate toDate,
        List<UUID> payerIds,
        List<UUID> programIds,
        List<UUID> serviceTypeIds,
        Pageable pageable
    );
    
    /**
     * Get Active Employees report
     */
    Page<ActiveEmployeeDTO> getActiveEmployees(
        String employeeName,
        UUID officeId,
        LocalDate fromDate,
        LocalDate toDate,
        Pageable pageable
    );
    
    /**
     * Get Call Listing report
     */
    Page<CallListingDTO> getCallListing(
        LocalDate fromDate,
        LocalDate toDate,
        String employeeName,
        String clientMedicaidId,
        String clientSearch,
        List<UUID> payerIds,
        List<UUID> programIds,
        List<UUID> serviceTypeIds,
        UUID supervisorId,
        UUID officeId,
        Pageable pageable
    );
    
    /**
     * Get Call Summary report
     */
    Page<CallSummaryDTO> getCallSummary(
        LocalDate fromDate,
        LocalDate toDate,
        String clientMedicaidId,
        String clientSearch,
        List<UUID> payerIds,
        List<UUID> programIds,
        List<UUID> serviceTypeIds,
        String employeeName,
        UUID supervisorId,
        UUID officeId,
        Pageable pageable
    );
    
    /**
     * Get Client Address Listing report
     */
    Page<ClientAddressListingDTO> getClientAddressListing(
        String clientMedicaidId,
        Pageable pageable
    );
    
    /**
     * Get Employee Attributes report
     */
    Page<EmployeeAttributesDTO> getEmployeeAttributes(
        String employeeName,
        Pageable pageable
    );
    
    /**
     * Get GPS Distance Exception report
     */
    Page<GpsDistanceExceptionDTO> getGpsDistanceException(
        LocalDate fromDate,
        LocalDate toDate,
        List<UUID> serviceTypeIds,
        Pageable pageable
    );
    
    /**
     * Get Payer-Program-Service Listing report
     */
    Page<PayerProgramServiceListingDTO> getPayerProgramServiceListing(
        List<UUID> payerIds,
        List<UUID> programIds,
        Pageable pageable
    );
    
    /**
     * Get Visit Listing report
     */
    Page<VisitListingDTO> getVisitListing(
        LocalDate fromDate,
        LocalDate toDate,
        List<UUID> payerIds,
        List<UUID> programIds,
        List<UUID> serviceTypeIds,
        String clientMedicaidId,
        String employeeName,
        UUID supervisorId,
        String department,
        Pageable pageable
    );
}
