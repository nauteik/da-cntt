package com.example.backend.controller;

import com.example.backend.model.dto.*;
import com.example.backend.model.dto.report.ReportFilterDTO;
import com.example.backend.model.dto.schedule.ScheduleEventDTO;
import com.example.backend.model.enums.VisitStatus;
import com.example.backend.service.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
 * REST controller for export operations
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF', 'DSP')")
public class ExportController {

    private final ExcelExportService excelExportService;
    private final PatientService patientService;
    private final HouseService houseService;
    private final ScheduleService scheduleService;
    private final StaffService staffService;
    private final ServiceDeliveryService serviceDeliveryService;
    private final ReportService reportService;

    /**
     * Export Patients to Excel
     */
    @GetMapping("/patients/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<byte[]> exportPatients(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) List<String> status,
        @RequestParam(required = false) List<String> program,
        @RequestParam(required = false) List<String> services
    ) {
        
        try {
            Page<PatientSummaryDTO> data = patientService.getPatientSummaries(
                search, status, program, services, 0, Integer.MAX_VALUE, null, "asc"
            );
            
            byte[] excelData = excelExportService.exportPatientsReport(data.getContent(), "Patients");
            String filename = "Patients_" + getCurrentTimestamp() + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating Excel export for patients", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export Houses to Excel
     */
    @GetMapping("/houses/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<byte[]> exportHouses(
        @RequestParam(required = false) UUID officeId,
        @RequestParam(required = false) String search
    ) {
        try {
            Pageable unpaged = Pageable.unpaged();
            Page<HouseDTO> data = houseService.getAllHouses(unpaged, officeId, search);
            
            byte[] excelData = excelExportService.exportHousesReport(data.getContent(), "Houses");
            String filename = "Houses_" + getCurrentTimestamp() + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating Excel export for houses", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export Schedule Events to Excel
     */
    @GetMapping("/schedules/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<byte[]> exportScheduleEvents(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) UUID patientId,
        @RequestParam(required = false) UUID staffId,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String search
    ) {

        try {
            Page<ScheduleEventDTO> data = scheduleService.getAllScheduleEvents(
                from, to, patientId, staffId, status, search, 0, Integer.MAX_VALUE, null, "asc"
            );
            
            byte[] excelData = excelExportService.exportScheduleEventsReport(data.getContent(), "Schedule Events");
            String filename = "ScheduleEvents_" + getCurrentTimestamp() + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating Excel export for schedule events", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export Staff to Excel
     */
    @GetMapping("/staff/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<byte[]> exportStaff(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) List<String> status,
        @RequestParam(required = false) List<String> role
    ) {
        
        try {
            Page<StaffSummaryDTO> data = staffService.getStaffSummaries(
                search, status, role, 0, Integer.MAX_VALUE, null, "asc"
            );
            
            byte[] excelData = excelExportService.exportStaffReport(data.getContent(), "Staff");
            String filename = "Staff_" + getCurrentTimestamp() + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating Excel export for staff", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export Authorizations to Excel
     */
    @GetMapping("/authorizations/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<byte[]> exportAuthorizations(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false) UUID payerId,
        @RequestParam(required = false) UUID supervisorId,
        @RequestParam(required = false) UUID programId,
        @RequestParam(required = false) UUID serviceTypeId,
        @RequestParam(required = false) String authorizationNo,
        @RequestParam(required = false) String clientId,
        @RequestParam(required = false) String clientFirstName,
        @RequestParam(required = false) String clientLastName,
        @RequestParam(required = false) String status
    ) {
        
        try {
            // Build ReportFilterDTO from parameters
            ReportFilterDTO filters = new ReportFilterDTO();
            filters.setFromDate(startDate);
            filters.setToDate(endDate);
            if (payerId != null) {
                filters.setPayerIds(List.of(payerId));
            }
            if (programId != null) {
                filters.setProgramIds(List.of(programId));
            }
            if (serviceTypeId != null) {
                filters.setServiceTypeIds(List.of(serviceTypeId));
            }
            if (clientId != null) {
                filters.setClientMedicaidId(clientId);
            }
            if (clientFirstName != null && clientLastName != null) {
                filters.setClientSearch(clientFirstName + " " + clientLastName);
            }
            
            Pageable unpaged = Pageable.unpaged();
            Page<AuthorizationSearchDTO> data = reportService.getAuthorizationsReport(filters, unpaged);
            
            byte[] excelData = excelExportService.exportAuthorizationsReport(data.getContent(), "Authorizations");
            String filename = "Authorizations_" + getCurrentTimestamp() + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating Excel export for authorizations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export Visit Maintenance to Excel
     */
    @GetMapping("/visits/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<byte[]> exportVisits(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
        @RequestParam(required = false) UUID clientId,
        @RequestParam(required = false) UUID employeeId,
        @RequestParam(required = false) UUID officeId,
        @RequestParam(required = false) VisitStatus status,
        @RequestParam(required = false) String search,
        @RequestParam(required = false) Boolean cancelled
    ) {
        
        try {
            Page<VisitMaintenanceDTO> data = serviceDeliveryService.getVisitMaintenance(
                startDate, endDate, clientId, employeeId, officeId, status, search, cancelled,
                0, Integer.MAX_VALUE, "startAt", "desc"
            );
            
            byte[] excelData = excelExportService.exportVisitMaintenanceReport(data.getContent(), "Visit Maintenance");
            String filename = "VisitMaintenance_" + getCurrentTimestamp() + ".xlsx";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (IOException e) {
            log.error("Error generating Excel export for visit maintenance", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private String getCurrentTimestamp() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }
}
