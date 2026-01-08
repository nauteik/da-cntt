package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.report.*;
import com.example.backend.service.ExcelExportService;
import com.example.backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for report operations
 */
@RestController
@RequestMapping("/api/reports/authorization")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
public class ReportController {

    private final ReportService reportService;
    private final ExcelExportService excelExportService;

    /**
     * Get Authorization vs Actual Used by Client report
     */
    @GetMapping("/auth-vs-actual")
    public ResponseEntity<ApiResponse<Page<AuthVsActualReportDTO>>> getAuthVsActualReport(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) LocalTime fromTime,
        @RequestParam(required = false) LocalTime toTime,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/authorization/auth-vs-actual - fromDate: {}, toDate: {}", fromDate, toDate);
        
        ReportFilterDTO filters = new ReportFilterDTO();
        filters.setFromDate(fromDate);
        filters.setToDate(toDate);
        filters.setFromTime(fromTime);
        filters.setToTime(toTime);
        filters.setPayerIds(payerIds);
        filters.setProgramIds(programIds);
        filters.setServiceTypeIds(serviceTypeIds);
        filters.setClientMedicaidId(clientMedicaidId);
        filters.setClientSearch(clientSearch);
        
        Page<AuthVsActualReportDTO> result = reportService.getAuthVsActualReport(filters, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Authorizations report
     */
    @GetMapping("/authorizations")
    public ResponseEntity<ApiResponse<Page<AuthorizationSearchDTO>>> getAuthorizationsReport(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) LocalTime fromTime,
        @RequestParam(required = false) LocalTime toTime,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/authorization/authorizations - fromDate: {}, toDate: {}", fromDate, toDate);
        
        ReportFilterDTO filters = new ReportFilterDTO();
        filters.setFromDate(fromDate);
        filters.setToDate(toDate);
        filters.setFromTime(fromTime);
        filters.setToTime(toTime);
        filters.setPayerIds(payerIds);
        filters.setProgramIds(programIds);
        filters.setServiceTypeIds(serviceTypeIds);
        filters.setClientMedicaidId(clientMedicaidId);
        filters.setClientSearch(clientSearch);
        
        Page<AuthorizationSearchDTO> result = reportService.getAuthorizationsReport(filters, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Clients Without Authorizations report
     */
    @GetMapping("/clients-without-auth")
    public ResponseEntity<ApiResponse<Page<ClientsWithoutAuthReportDTO>>> getClientsWithoutAuthReport(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) LocalTime fromTime,
        @RequestParam(required = false) LocalTime toTime,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/authorization/clients-without-auth - fromDate: {}, toDate: {}", fromDate, toDate);
        
        ReportFilterDTO filters = new ReportFilterDTO();
        filters.setFromDate(fromDate);
        filters.setToDate(toDate);
        filters.setFromTime(fromTime);
        filters.setToTime(toTime);
        filters.setClientMedicaidId(clientMedicaidId);
        filters.setClientSearch(clientSearch);
        
        Page<ClientsWithoutAuthReportDTO> result = reportService.getClientsWithoutAuthReport(filters, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Expiring Authorizations report
     */
    @GetMapping("/expiring-auth")
    public ResponseEntity<ApiResponse<Page<ExpiringAuthReportDTO>>> getExpiringAuthReport(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) LocalTime fromTime,
        @RequestParam(required = false) LocalTime toTime,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @RequestParam(required = true) Integer expiresAfterDays,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        
        ReportFilterDTO filters = new ReportFilterDTO();
        filters.setFromDate(fromDate);
        filters.setToDate(toDate);
        filters.setFromTime(fromTime);
        filters.setToTime(toTime);
        filters.setPayerIds(payerIds);
        filters.setProgramIds(programIds);
        filters.setServiceTypeIds(serviceTypeIds);
        filters.setClientMedicaidId(clientMedicaidId);
        filters.setClientSearch(clientSearch);
        filters.setExpiresAfterDays(expiresAfterDays);
        
        Page<ExpiringAuthReportDTO> result = reportService.getExpiringAuthReport(filters, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Export report to Excel
     */
    @GetMapping("/{reportType}/export")
    public ResponseEntity<byte[]> exportReport(
        @PathVariable String reportType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) LocalTime fromTime,
        @RequestParam(required = false) LocalTime toTime,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @RequestParam(required = false) Integer expiresAfterDays
    ) {
        log.info("GET /api/reports/authorization/{}/export - fromDate: {}, toDate: {}, expiresAfterDays: {}", reportType, fromDate, toDate, expiresAfterDays);
        
        try {
            ReportFilterDTO filters = new ReportFilterDTO();
            filters.setFromDate(fromDate);
            filters.setToDate(toDate);
            filters.setFromTime(fromTime);
            filters.setToTime(toTime);
            filters.setPayerIds(payerIds);
            filters.setProgramIds(programIds);
            filters.setServiceTypeIds(serviceTypeIds);
            filters.setClientMedicaidId(clientMedicaidId);
            filters.setClientSearch(clientSearch);
            if (expiresAfterDays != null) {
                filters.setExpiresAfterDays(expiresAfterDays);
            }
            
            // Fetch all data without pagination for export
            Pageable unpaged = Pageable.unpaged();
            byte[] excelData;
            String filename;
            
            switch (reportType) {
                case "auth-vs-actual":
                    Page<AuthVsActualReportDTO> authVsActualData = reportService.getAuthVsActualReport(filters, unpaged);
                    excelData = excelExportService.exportAuthVsActualReport(authVsActualData.getContent(), "Authorization vs Actual");
                    filename = "AuthVsActual_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "authorizations":
                    Page<AuthorizationSearchDTO> authData = reportService.getAuthorizationsReport(filters, unpaged);
                    excelData = excelExportService.exportAuthorizationsReport(authData.getContent(), "Authorizations");
                    filename = "Authorizations_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "clients-without-auth":
                    Page<ClientsWithoutAuthReportDTO> clientsData = reportService.getClientsWithoutAuthReport(filters, unpaged);
                    excelData = excelExportService.exportClientsWithoutAuthReport(clientsData.getContent(), "Clients Without Auth");
                    filename = "ClientsWithoutAuth_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "expiring-auth":
                    if (expiresAfterDays == null || expiresAfterDays <= 0) {
                        return ResponseEntity.badRequest().build();
                    }
                    Page<ExpiringAuthReportDTO> expiringData = reportService.getExpiringAuthReport(filters, unpaged);
                    excelData = excelExportService.exportExpiringAuthReport(expiringData.getContent(), "Expiring Authorizations");
                    filename = "ExpiringAuth_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                default:
                    return ResponseEntity.badRequest().build();
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
            
        } catch (IOException e) {
            log.error("Error generating Excel export for report type: {}", reportType, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private String getCurrentTimestamp() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }
}

