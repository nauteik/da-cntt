package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.report.*;
import com.example.backend.service.DailyReportService;
import com.example.backend.service.ExcelExportService;
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
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for daily report operations
 */
@RestController
@RequestMapping("/api/reports/daily")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
public class DailyReportController {

    private final DailyReportService dailyReportService;
    private final ExcelExportService excelExportService;

    /**
     * Get Active Client Contacts report
     */
    @GetMapping("/active-client-contacts")
    public ResponseEntity<ApiResponse<Page<ActiveClientContactDTO>>> getActiveClientContacts(
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) UUID supervisorId,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/active-client-contacts");
        Page<ActiveClientContactDTO> result = dailyReportService.getActiveClientContacts(
            clientMedicaidId,
            clientSearch,
            fromDate,
            toDate,
            payerIds,
            programIds,
            supervisorId,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Active Clients report
     */
    @GetMapping("/active-clients")
    public ResponseEntity<ApiResponse<Page<ActiveClientDTO>>> getActiveClients(
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/active-clients");
        Page<ActiveClientDTO> result = dailyReportService.getActiveClients(
            clientMedicaidId,
            clientSearch,
            fromDate,
            toDate,
            payerIds,
            programIds,
            serviceTypeIds,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Active Employees report
     */
    @GetMapping("/active-employees")
    public ResponseEntity<ApiResponse<Page<ActiveEmployeeDTO>>> getActiveEmployees(
        @RequestParam(required = false) String employeeName,
        @RequestParam(required = false) UUID officeId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/active-employees");
        Page<ActiveEmployeeDTO> result = dailyReportService.getActiveEmployees(
            employeeName,
            officeId,
            fromDate,
            toDate,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Call Listing report
     */
    @GetMapping("/call-listing")
    public ResponseEntity<ApiResponse<Page<CallListingDTO>>> getCallListing(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) String employeeName,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) UUID supervisorId,
        @RequestParam(required = false) UUID officeId,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/call-listing from {} to {}", fromDate, toDate);
        Page<CallListingDTO> result = dailyReportService.getCallListing(
            fromDate,
            toDate,
            employeeName,
            clientMedicaidId,
            clientSearch,
            payerIds,
            programIds,
            serviceTypeIds,
            supervisorId,
            officeId,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Call Summary report
     */
    @GetMapping("/call-summary")
    public ResponseEntity<ApiResponse<Page<CallSummaryDTO>>> getCallSummary(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) String employeeName,
        @RequestParam(required = false) UUID supervisorId,
        @RequestParam(required = false) UUID officeId,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/call-summary from {} to {}", fromDate, toDate);
        Page<CallSummaryDTO> result = dailyReportService.getCallSummary(
            fromDate,
            toDate,
            clientMedicaidId,
            clientSearch,
            payerIds,
            programIds,
            serviceTypeIds,
            employeeName,
            supervisorId,
            officeId,
            pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Client Address Listing report
     */
    @GetMapping("/client-address-listing")
    public ResponseEntity<ApiResponse<Page<ClientAddressListingDTO>>> getClientAddressListing(
        @RequestParam(required = false) String clientMedicaidId,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/client-address-listing");
        Page<ClientAddressListingDTO> result = dailyReportService.getClientAddressListing(clientMedicaidId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Employee Attributes report
     */
    @GetMapping("/employee-attributes")
    public ResponseEntity<ApiResponse<Page<EmployeeAttributesDTO>>> getEmployeeAttributes(
        @RequestParam(required = false) String employeeName,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/employee-attributes");
        Page<EmployeeAttributesDTO> result = dailyReportService.getEmployeeAttributes(employeeName, pageable);
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get GPS Distance Exception report
     */
    @GetMapping("/gps-distance-exception")
    public ResponseEntity<ApiResponse<Page<GpsDistanceExceptionDTO>>> getGpsDistanceException(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/gps-distance-exception from {} to {}", fromDate, toDate);
        Page<GpsDistanceExceptionDTO> result = dailyReportService.getGpsDistanceException(
            fromDate, toDate, serviceTypeIds, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Payer-Program-Service Listing report
     */
    @GetMapping("/payer-program-service-listing")
    public ResponseEntity<ApiResponse<Page<PayerProgramServiceListingDTO>>> getPayerProgramServiceListing(
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/payer-program-service-listing");
        Page<PayerProgramServiceListingDTO> result = dailyReportService.getPayerProgramServiceListing(
            payerIds, programIds, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Get Visit Listing report
     */
    @GetMapping("/visit-listing")
    public ResponseEntity<ApiResponse<Page<VisitListingDTO>>> getVisitListing(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String employeeName,
        @RequestParam(required = false) UUID supervisorId,
        @RequestParam(required = false) String department,
        @PageableDefault(size = 25) Pageable pageable
    ) {
        log.info("GET /api/reports/daily/visit-listing from {} to {}", fromDate, toDate);
        Page<VisitListingDTO> result = dailyReportService.getVisitListing(
            fromDate, toDate, payerIds, programIds, serviceTypeIds,
            clientMedicaidId, employeeName, supervisorId, department, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(result, "Report generated successfully"));
    }

    /**
     * Export daily report to Excel
     */
    @GetMapping("/{reportType}/export")
    public ResponseEntity<byte[]> exportReport(
        @PathVariable String reportType,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
        @RequestParam(required = false) List<UUID> payerIds,
        @RequestParam(required = false) List<UUID> programIds,
        @RequestParam(required = false) List<UUID> serviceTypeIds,
        @RequestParam(required = false) String clientMedicaidId,
        @RequestParam(required = false) String clientSearch,
        @RequestParam(required = false) String employeeName,
        @RequestParam(required = false) UUID supervisorId,
        @RequestParam(required = false) String department,
        @RequestParam(required = false) UUID officeId
    ) {
        log.info("GET /api/reports/daily/{}/export", reportType);
        
        try {
            Pageable unpaged = Pageable.unpaged();
            byte[] excelData;
            String filename;
            
            switch (reportType) {
                case "active-client-contacts":
                    Page<ActiveClientContactDTO> contactsData = dailyReportService.getActiveClientContacts(
                        clientMedicaidId,
                        clientSearch,
                        fromDate,
                        toDate,
                        payerIds,
                        programIds,
                        supervisorId,
                        unpaged
                    );
                    excelData = excelExportService.exportActiveClientContacts(contactsData.getContent(), "Active Client Contacts");
                    filename = "ActiveClientContacts_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "active-clients":
                    Page<ActiveClientDTO> clientsData = dailyReportService.getActiveClients(
                        clientMedicaidId,
                        clientSearch,
                        fromDate,
                        toDate,
                        payerIds,
                        programIds,
                        serviceTypeIds,
                        unpaged
                    );
                    excelData = excelExportService.exportActiveClients(clientsData.getContent(), "Active Clients");
                    filename = "ActiveClients_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "active-employees":
                    Page<ActiveEmployeeDTO> employeesData = dailyReportService.getActiveEmployees(
                        employeeName,
                        officeId,
                        fromDate,
                        toDate,
                        unpaged
                    );
                    excelData = excelExportService.exportActiveEmployees(employeesData.getContent(), "Active Employees");
                    filename = "ActiveEmployees_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "call-listing":
                    Page<CallListingDTO> callListingData = dailyReportService.getCallListing(
                        fromDate,
                        toDate,
                        employeeName,
                        clientMedicaidId,
                        clientSearch,
                        payerIds,
                        programIds,
                        serviceTypeIds,
                        supervisorId,
                        officeId,
                        unpaged
                    );
                    excelData = excelExportService.exportCallListing(callListingData.getContent(), "Call Listing");
                    filename = "CallListing_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "call-summary":
                    Page<CallSummaryDTO> callSummaryData = dailyReportService.getCallSummary(
                        fromDate,
                        toDate,
                        clientMedicaidId,
                        clientSearch,
                        payerIds,
                        programIds,
                        serviceTypeIds,
                        employeeName,
                        supervisorId,
                        officeId,
                        unpaged
                    );
                    excelData = excelExportService.exportCallSummary(callSummaryData.getContent(), "Call Summary");
                    filename = "CallSummary_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "client-address-listing":
                    Page<ClientAddressListingDTO> addressData = dailyReportService.getClientAddressListing(
                        clientMedicaidId, unpaged
                    );
                    excelData = excelExportService.exportClientAddressListing(addressData.getContent(), "Client Address Listing");
                    filename = "ClientAddressListing_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "employee-attributes":
                    Page<EmployeeAttributesDTO> attributesData = dailyReportService.getEmployeeAttributes(
                        employeeName, unpaged
                    );
                    excelData = excelExportService.exportEmployeeAttributes(attributesData.getContent(), "Employee Attributes");
                    filename = "EmployeeAttributes_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "gps-distance-exception":
                    Page<GpsDistanceExceptionDTO> gpsData = dailyReportService.getGpsDistanceException(
                        fromDate, toDate, serviceTypeIds, unpaged
                    );
                    excelData = excelExportService.exportGpsDistanceException(gpsData.getContent(), "GPS Distance Exception");
                    filename = "GpsDistanceException_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "payer-program-service-listing":
                    Page<PayerProgramServiceListingDTO> ppsData = dailyReportService.getPayerProgramServiceListing(
                        payerIds, programIds, unpaged
                    );
                    excelData = excelExportService.exportPayerProgramServiceListing(ppsData.getContent(), "Payer-Program-Service Listing");
                    filename = "PayerProgramServiceListing_" + getCurrentTimestamp() + ".xlsx";
                    break;
                    
                case "visit-listing":
                    Page<VisitListingDTO> visitData = dailyReportService.getVisitListing(
                        fromDate, toDate, payerIds, programIds, serviceTypeIds,
                        clientMedicaidId, employeeName, supervisorId, department, unpaged
                    );
                    excelData = excelExportService.exportVisitListing(visitData.getContent(), "Visit Listing");
                    filename = "VisitListing_" + getCurrentTimestamp() + ".xlsx";
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
