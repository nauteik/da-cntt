package com.example.backend.service.impl;

import com.example.backend.model.dto.report.*;
import com.example.backend.repository.DailyReportRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.service.DailyReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of DailyReportService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DailyReportServiceImpl implements DailyReportService {

    private final DailyReportRepository dailyReportRepository;
    private final PatientRepository patientRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ActiveClientContactDTO> getActiveClientContacts(
        String clientMedicaidId,
        String clientSearch,
        LocalDate fromDate,
        LocalDate toDate,
        List<UUID> payerIds,
        List<UUID> programIds,
        UUID supervisorId,
        Pageable pageable
    ) {
        log.info("Generating Active Client Contacts report with clientMedicaidId: {}", clientMedicaidId);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        UUID[] payerIdsArray = payerIds != null && !payerIds.isEmpty() ? payerIds.toArray(new UUID[0]) : null;
        UUID[] programIdsArray = programIds != null && !programIds.isEmpty() ? programIds.toArray(new UUID[0]) : null;

        List<ActiveClientContactProjection> projections = dailyReportRepository.findActiveClientContacts(
            clientMedicaidId,
            clientSearch,
            fromDate,
            toDate,
            payerIdsArray,
            programIdsArray,
            supervisorId,
            limit,
            offset
        );
        
        List<ActiveClientContactDTO> content = projections.stream()
            .map(proj -> new ActiveClientContactDTO(
                proj.getAccountName(),
                proj.getClientName(),
                proj.getClientMedicaidId(),
                proj.getContactName(),
                proj.getRelationshipToClient(),
                proj.getEmail()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countActiveClientContacts(
            clientMedicaidId,
            clientSearch,
            fromDate,
            toDate,
            payerIdsArray,
            programIdsArray,
            supervisorId
        );
        
        log.info("Found {} active client contacts out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActiveClientDTO> getActiveClients(
        String clientMedicaidId,
        String clientSearch,
        LocalDate fromDate,
        LocalDate toDate,
        List<UUID> payerIds,
        List<UUID> programIds,
        List<UUID> serviceTypeIds,
        Pageable pageable
    ) {
        log.info("Generating Active Clients report with clientMedicaidId: {}", clientMedicaidId);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        UUID[] payerIdsArray = payerIds != null && !payerIds.isEmpty() ? payerIds.toArray(new UUID[0]) : null;
        UUID[] programIdsArray = programIds != null && !programIds.isEmpty() ? programIds.toArray(new UUID[0]) : null;
        UUID[] serviceTypeIdsArray = serviceTypeIds != null && !serviceTypeIds.isEmpty()
            ? serviceTypeIds.toArray(new UUID[0]) : null;

        List<ActiveClientProjection> projections = dailyReportRepository.findActiveClients(
            clientMedicaidId,
            clientSearch,
            fromDate,
            toDate,
            payerIdsArray,
            programIdsArray,
            serviceTypeIdsArray,
            limit,
            offset
        );
        
        long total = dailyReportRepository.countActiveClients(
            clientMedicaidId,
            clientSearch,
            fromDate,
            toDate,
            payerIdsArray,
            programIdsArray,
            serviceTypeIdsArray
        );
        
        List<ActiveClientDTO> content = projections.stream()
            .map(proj -> new ActiveClientDTO(
                proj.getAccountName(),
                proj.getProviderId(),
                proj.getClientMedicaidId(),
                proj.getClientName(),
                proj.getPhone(),
                proj.getAddress(),
                proj.getCity(),
                proj.getState(),
                proj.getZip(),
                proj.getCounty(),
                proj.getLatitude(),
                proj.getLongitude(),
                proj.getActiveSinceDate(),
                total
            ))
            .collect(Collectors.toList());
        
        log.info("Found {} active clients out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActiveEmployeeDTO> getActiveEmployees(
        String employeeName,
        UUID officeId,
        LocalDate fromDate,
        LocalDate toDate,
        Pageable pageable
    ) {
        log.info("Generating Active Employees report with employeeName: {}", employeeName);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        List<ActiveEmployeeProjection> projections = dailyReportRepository.findActiveEmployees(
            employeeName, officeId, fromDate, toDate, limit, offset
        );
        
        long total = dailyReportRepository.countActiveEmployees(employeeName, officeId, fromDate, toDate);
        
        List<ActiveEmployeeDTO> content = projections.stream()
            .map(proj -> new ActiveEmployeeDTO(
                proj.getAccountName(),
                proj.getEmployeeId(),
                proj.getEmployeeName(),
                proj.getEmployeeEmail(),
                proj.getPhone(),
                proj.getDepartment(),
                total
            ))
            .collect(Collectors.toList());
        
        log.info("Found {} active employees out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CallListingDTO> getCallListing(
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
    ) {
        log.info("Generating Call Listing report from {} to {}", fromDate, toDate);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        UUID[] payerIdsArray = payerIds != null && !payerIds.isEmpty() ? payerIds.toArray(new UUID[0]) : null;
        UUID[] programIdsArray = programIds != null && !programIds.isEmpty() ? programIds.toArray(new UUID[0]) : null;
        UUID[] serviceTypeIdsArray = serviceTypeIds != null && !serviceTypeIds.isEmpty()
            ? serviceTypeIds.toArray(new UUID[0]) : null;

        List<CallListingProjection> projections = dailyReportRepository.findCallListing(
            fromDate,
            toDate,
            employeeName,
            clientMedicaidId,
            clientSearch,
            payerIdsArray,
            programIdsArray,
            serviceTypeIdsArray,
            supervisorId,
            officeId,
            limit,
            offset
        );
        
        List<CallListingDTO> content = projections.stream()
            .map(proj -> new CallListingDTO(
                proj.getServiceId(),
                proj.getAccountName(),
                proj.getAccountId(),
                proj.getClientId(),
                proj.getClientMedicaidId(),
                proj.getClientName(),
                proj.getPhone(),
                proj.getEmployeeName(),
                proj.getEmployeeId(),
                proj.getVisitDate(),
                proj.getStartTime(),
                proj.getEndTime(),
                proj.getCallInTime(),
                proj.getCallOutTime(),
                proj.getVisitKey(),
                proj.getGroupCode(),
                proj.getStatus(),
                proj.getIndicators()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countCallListing(
            fromDate,
            toDate,
            employeeName,
            clientMedicaidId,
            clientSearch,
            payerIdsArray,
            programIdsArray,
            serviceTypeIdsArray,
            supervisorId,
            officeId
        );
        
        log.info("Found {} call listing records out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CallSummaryDTO> getCallSummary(
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
    ) {
        log.info("Generating Call Summary report from {} to {}", fromDate, toDate);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        UUID[] payerIdsArray = payerIds != null && !payerIds.isEmpty() ? payerIds.toArray(new UUID[0]) : null;
        UUID[] programIdsArray = programIds != null && !programIds.isEmpty() ? programIds.toArray(new UUID[0]) : null;
        UUID[] serviceTypeIdsArray = serviceTypeIds != null && !serviceTypeIds.isEmpty()
            ? serviceTypeIds.toArray(new UUID[0]) : null;

        List<CallSummaryProjection> projections = dailyReportRepository.findCallSummary(
            fromDate,
            toDate,
            clientMedicaidId,
            clientSearch,
            payerIdsArray,
            programIdsArray,
            serviceTypeIdsArray,
            employeeName,
            supervisorId,
            officeId,
            limit,
            offset
        );
        
        List<CallSummaryDTO> content = projections.stream()
            .map(proj -> new CallSummaryDTO(
                proj.getOfficeId(),
                proj.getClientId(),
                proj.getClientMedicaidId(),
                proj.getClientName(),
                proj.getEmployeeName(),
                proj.getEmployeeId(),
                proj.getVisitKey(),
                proj.getStartTime(),
                proj.getEndTime(),
                proj.getCallsStart(),
                proj.getCallsEnd(),
                proj.getHoursTotal(),
                proj.getUnits()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countCallSummary(
            fromDate,
            toDate,
            clientMedicaidId,
            clientSearch,
            payerIdsArray,
            programIdsArray,
            serviceTypeIdsArray,
            employeeName,
            supervisorId,
            officeId
        );
        
        log.info("Found {} call summary records out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ClientAddressListingDTO> getClientAddressListing(String clientMedicaidId, Pageable pageable) {
        log.info("Generating Client Address Listing report with clientMedicaidId: {}", clientMedicaidId);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        List<ClientAddressListingProjection> projections = dailyReportRepository.findClientAddressListing(
            clientMedicaidId, limit, offset
        );
        
        List<ClientAddressListingDTO> content = projections.stream()
            .map(proj -> new ClientAddressListingDTO(
                proj.getAccountId(),
                proj.getAccountName(),
                proj.getClientMedicaidId(),
                proj.getClientName(),
                proj.getTag(),
                proj.getAddressType(),
                proj.getPhone(),
                proj.getAddress(),
                proj.getCity(),
                proj.getState(),
                proj.getZip(),
                proj.getCounty()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countClientAddressListing(clientMedicaidId);
        
        log.info("Found {} client addresses out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmployeeAttributesDTO> getEmployeeAttributes(String employeeName, Pageable pageable) {
        log.info("Generating Employee Attributes report with employeeName: {}", employeeName);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        List<EmployeeAttributesProjection> projections = dailyReportRepository.findEmployeeAttributes(
            employeeName, limit, offset
        );
        
        List<EmployeeAttributesDTO> content = projections.stream()
            .map(proj -> new EmployeeAttributesDTO(
                proj.getEmployeeName(),
                proj.getAttributeName(),
                proj.getAttributeValue()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countEmployeeAttributes(employeeName);
        
        log.info("Found {} employee attributes out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GpsDistanceExceptionDTO> getGpsDistanceException(
        LocalDate fromDate, LocalDate toDate, List<UUID> serviceTypeIds, Pageable pageable
    ) {
        log.info("Generating GPS Distance Exception report from {} to {}", fromDate, toDate);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        UUID[] serviceTypeIdsArray = serviceTypeIds != null && !serviceTypeIds.isEmpty() 
            ? serviceTypeIds.toArray(new UUID[0]) : null;
        
        List<GpsDistanceExceptionProjection> projections = dailyReportRepository.findGpsDistanceException(
            fromDate, toDate, serviceTypeIdsArray, limit, offset
        );
        
        List<GpsDistanceExceptionDTO> content = projections.stream()
            .map(proj -> new GpsDistanceExceptionDTO(
                proj.getServiceId(),
                proj.getAccountName(),
                proj.getClientName(),
                proj.getClientMedicaidId(),
                proj.getEmployeeName(),
                proj.getVisitDate(),
                proj.getStartTime(),
                proj.getEndTime(),
                proj.getExpectedDistance(),
                proj.getActualDistance(),
                proj.getVariance(),
                proj.getExceptionReason()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countGpsDistanceException(fromDate, toDate, serviceTypeIdsArray);
        
        log.info("Found {} GPS distance exceptions out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PayerProgramServiceListingDTO> getPayerProgramServiceListing(
        List<UUID> payerIds, List<UUID> programIds, Pageable pageable
    ) {
        log.info("Generating Payer-Program-Service Listing report");
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        UUID[] payerIdsArray = payerIds != null && !payerIds.isEmpty() 
            ? payerIds.toArray(new UUID[0]) : null;
        UUID[] programIdsArray = programIds != null && !programIds.isEmpty() 
            ? programIds.toArray(new UUID[0]) : null;
        
        List<PayerProgramServiceListingProjection> projections = dailyReportRepository.findPayerProgramServiceListing(
            payerIdsArray, programIdsArray, limit, offset
        );
        
        List<PayerProgramServiceListingDTO> content = projections.stream()
            .map(proj -> new PayerProgramServiceListingDTO(
                proj.getPayerName(),
                proj.getProgramName(),
                proj.getServiceCode(),
                proj.getServiceName()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countPayerProgramServiceListing(payerIdsArray, programIdsArray);
        
        log.info("Found {} payer-program-service combinations out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VisitListingDTO> getVisitListing(
        LocalDate fromDate, LocalDate toDate, List<UUID> payerIds, List<UUID> programIds, 
        List<UUID> serviceTypeIds, String clientMedicaidId, String employeeName, 
        UUID supervisorId, String department, Pageable pageable
    ) {
        log.info("Generating Visit Listing report from {} to {}", fromDate, toDate);
        
        boolean isUnpaged = pageable.isUnpaged();
        int offset = isUnpaged ? 0 : (int) pageable.getOffset();
        int limit = isUnpaged ? Integer.MAX_VALUE : pageable.getPageSize();
        
        UUID[] payerIdsArray = payerIds != null && !payerIds.isEmpty() 
            ? payerIds.toArray(new UUID[0]) : null;
        UUID[] programIdsArray = programIds != null && !programIds.isEmpty() 
            ? programIds.toArray(new UUID[0]) : null;
        UUID[] serviceTypeIdsArray = serviceTypeIds != null && !serviceTypeIds.isEmpty() 
            ? serviceTypeIds.toArray(new UUID[0]) : null;
        
        List<VisitListingProjection> projections = dailyReportRepository.findVisitListing(
            fromDate, toDate, payerIdsArray, programIdsArray, serviceTypeIdsArray,
            clientMedicaidId, employeeName, supervisorId, department, limit, offset
        );
        
        List<VisitListingDTO> content = projections.stream()
            .map(proj -> new VisitListingDTO(
                proj.getPayerId(),
                proj.getAccountName(),
                proj.getAccountId(),
                proj.getProviderId(),
                proj.getClientMedicaidId(),
                proj.getClientName(),
                proj.getEmployeeName(),
                proj.getEmployeeId(),
                proj.getVisitDate(),
                proj.getStartTime(),
                proj.getEndTime(),
                proj.getVisitKey(),
                proj.getStatus()
            ))
            .collect(Collectors.toList());
        
        long total = dailyReportRepository.countVisitListing(
            fromDate, toDate, payerIdsArray, programIdsArray, serviceTypeIdsArray,
            clientMedicaidId, employeeName, supervisorId, department
        );
        
        log.info("Found {} visit listing records out of {} total", content.size(), total);
        return new PageImpl<>(content, pageable, total);
    }
}
