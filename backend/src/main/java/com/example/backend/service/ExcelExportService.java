package com.example.backend.service;

import com.example.backend.model.dto.*;
import com.example.backend.model.dto.report.*;
import com.example.backend.model.dto.schedule.ScheduleEventDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service for exporting reports to Excel format
 */
@Service
@Slf4j
public class ExcelExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    /**
     * Export Authorization vs Actual report to Excel
     */
    public byte[] exportAuthVsActualReport(List<AuthVsActualReportDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Authorization vs Actual report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Auth vs Actual");
            
            // Create header style
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Client Name", "Type", "Medicaid ID", "Alternate Payer", "Payer",
                "Program", "Service", "Auth Start Date", "Auth End Date", "Auth ID",
                "Authorized Units", "Used Units", "Available Units", "Limit Type", "Jurisdiction"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Create data rows
            int rowNum = 1;
            for (AuthVsActualReportDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getClientType(), dataStyle);
                createCell(row, colNum++, dto.getMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getAlternatePayer(), dataStyle);
                createCell(row, colNum++, dto.getPayer(), dataStyle);
                createCell(row, colNum++, dto.getProgram(), dataStyle);
                createCell(row, colNum++, dto.getService(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getAuthStartDate()), dataStyle);
                createCell(row, colNum++, formatDate(dto.getAuthEndDate()), dataStyle);
                createCell(row, colNum++, dto.getAuthId(), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getAuthorizedUnits()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getUsedUnits()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getAvailableUnits()), dataStyle);
                createCell(row, colNum++, dto.getLimitType(), dataStyle);
                createCell(row, colNum++, dto.getJurisdiction(), dataStyle);
            }
            
            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Authorizations report to Excel
     */
    public byte[] exportAuthorizationsReport(List<AuthorizationSearchDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Authorizations report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Authorizations");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Client Name", "Payer", "Program", "Service", 
                "Authorization No", "Start Date", "End Date",
                "Max Units", "Total Used", "Total Remaining", "Status"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (AuthorizationSearchDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getPayerName(), dataStyle);
                createCell(row, colNum++, dto.getProgramIdentifier(), dataStyle);
                createCell(row, colNum++, dto.getServiceCode(), dataStyle);
                createCell(row, colNum++, dto.getAuthorizationNo(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getStartDate()), dataStyle);
                createCell(row, colNum++, formatDate(dto.getEndDate()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getMaxUnits()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getTotalUsed()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getTotalRemaining()), dataStyle);
                createCell(row, colNum++, dto.getStatus(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Clients Without Authorizations report to Excel
     */
    public byte[] exportClientsWithoutAuthReport(List<ClientsWithoutAuthReportDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Clients Without Authorizations report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Clients Without Auth");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Client Name", "Type", "Medicaid ID", "Alternate Payer",
                "Payer", "Program", "Service", "Supervisor"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (ClientsWithoutAuthReportDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getClientType(), dataStyle);
                createCell(row, colNum++, dto.getMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getAlternatePayer(), dataStyle);
                createCell(row, colNum++, dto.getPayer(), dataStyle);
                createCell(row, colNum++, dto.getProgram(), dataStyle);
                createCell(row, colNum++, dto.getService(), dataStyle);
                createCell(row, colNum++, dto.getSupervisor(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Expiring Authorizations report to Excel
     */
    public byte[] exportExpiringAuthReport(List<ExpiringAuthReportDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Expiring Authorizations report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Expiring Authorizations");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Client Name", "Type", "Medicaid ID", "Alternate Payer", "Payer",
                "Program", "Service", "Start Date", "End Date", "Auth ID",
                "Authorized Units", "Limit", "Available", "Jurisdiction", "Days Until Expiration"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (ExpiringAuthReportDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getClientType(), dataStyle);
                createCell(row, colNum++, dto.getMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getAlternatePayer(), dataStyle);
                createCell(row, colNum++, dto.getPayer(), dataStyle);
                createCell(row, colNum++, dto.getProgram(), dataStyle);
                createCell(row, colNum++, dto.getService(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getStartDate()), dataStyle);
                createCell(row, colNum++, formatDate(dto.getEndDate()), dataStyle);
                createCell(row, colNum++, dto.getAuthId(), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getAuthorizedUnits()), dataStyle);
                createCell(row, colNum++, dto.getLimit(), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getAvailable()), dataStyle);
                createCell(row, colNum++, dto.getJurisdiction(), dataStyle);
                createCell(row, colNum++, dto.getDaysUntilExpiration() != null ? dto.getDaysUntilExpiration().toString() : "", dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    // Helper methods
    
    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.CENTER);
        return style;
    }
    
    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
    
    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }
    
    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "";
    }
    
    private String formatDecimal(BigDecimal value) {
        return value != null ? value.toString() : "0";
    }

    /**
     * Export Patients report to Excel
     */
    public byte[] exportPatientsReport(List<PatientSummaryDTO> data, String reportTitle) throws IOException {
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Patients");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Name", "Medicaid ID", "Client ID", "Status", "Program", 
                "Services", "Supervisor", "As Of", "SOC", "EOC"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (PatientSummaryDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getClientPayerId(), dataStyle);
                createCell(row, colNum++, dto.getStatus() != null ? dto.getStatus().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getProgram(), dataStyle);
                createCell(row, colNum++, dto.getServices() != null ? String.join(", ", dto.getServices()) : "", dataStyle);
                createCell(row, colNum++, dto.getSupervisor(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getAsOf()), dataStyle);
                createCell(row, colNum++, formatDate(dto.getSoc()), dataStyle);
                createCell(row, colNum++, formatDate(dto.getEoc()), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Houses report to Excel
     */
    public byte[] exportHousesReport(List<HouseDTO> data, String reportTitle) throws IOException {
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Houses");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Code", "Name", "Office", "Address", "Status", "Current Patient", "Description"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (HouseDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getCode(), dataStyle);
                createCell(row, colNum++, dto.getName(), dataStyle);
                createCell(row, colNum++, dto.getOfficeName(), dataStyle);
                createCell(row, colNum++, dto.getFullAddress() != null ? dto.getFullAddress() : 
                    (dto.getAddressLine1() != null ? dto.getAddressLine1() + ", " + dto.getCity() + ", " + dto.getState() : ""), dataStyle);
                createCell(row, colNum++, dto.getIsActive() != null && dto.getIsActive() ? "Active" : "Inactive", dataStyle);
                createCell(row, colNum++, dto.getCurrentPatientName(), dataStyle);
                createCell(row, colNum++, dto.getDescription(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Schedule Events report to Excel
     */
    public byte[] exportScheduleEventsReport(List<ScheduleEventDTO> data, String reportTitle) throws IOException {
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Schedule Events");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Date", "Patient", "Staff", "Start Time", "End Time", "Status", 
                "Planned Units", "Actual Units", "Program", "Service Code"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (ScheduleEventDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, formatDate(dto.getEventDate()), dataStyle);
                createCell(row, colNum++, dto.getPatientName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, formatDateTime(dto.getStartAt()), dataStyle);
                createCell(row, colNum++, formatDateTime(dto.getEndAt()), dataStyle);
                createCell(row, colNum++, dto.getStatus(), dataStyle);
                createCell(row, colNum++, dto.getPlannedUnits() != null ? dto.getPlannedUnits().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getActualUnits() != null ? dto.getActualUnits().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getProgramIdentifier(), dataStyle);
                createCell(row, colNum++, dto.getServiceCode(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Staff report to Excel
     */
    public byte[] exportStaffReport(List<StaffSummaryDTO> data, String reportTitle) throws IOException {
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Staff");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Name", "Employee ID", "Role", "Status", "Hire Date", "Release Date"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (StaffSummaryDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeId(), dataStyle);
                createCell(row, colNum++, dto.getPosition(), dataStyle);
                createCell(row, colNum++, dto.getStatus(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getHireDate()), dataStyle);
                createCell(row, colNum++, formatDate(dto.getReleaseDate()), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Visit Maintenance report to Excel
     */
    public byte[] exportVisitMaintenanceReport(List<VisitMaintenanceDTO> data, String reportTitle) throws IOException {
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Visit Maintenance");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Date", "Client", "Employee", "Start Time", "End Time", "Status", 
                "Hours", "Units", "Service Code", "Authorization No"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (VisitMaintenanceDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getVisitDate(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, dto.getScheduledTimeIn(), dataStyle);
                createCell(row, colNum++, dto.getScheduledTimeOut(), dataStyle);
                createCell(row, colNum++, dto.getVisitStatusDisplay() != null ? dto.getVisitStatusDisplay() : 
                    (dto.getVisitStatus() != null ? dto.getVisitStatus().toString() : ""), dataStyle);
                createCell(row, colNum++, dto.getBillHours() != null ? dto.getBillHours().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getUnits() != null ? dto.getUnits().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getServiceCode(), dataStyle);
                createCell(row, colNum++, dto.getAuthorizationNumber(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    // Additional helper methods
    
    private String formatDateTime(OffsetDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm");
        return dateTime.format(formatter);
    }

    /**
     * Export Active Client Contacts report to Excel
     */
    public byte[] exportActiveClientContacts(List<ActiveClientContactDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Active Client Contacts report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Active Client Contacts");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Account Name", "Client Name", "Client Medicaid ID", "Contact Name", "Relationship", "Email"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (ActiveClientContactDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getAccountName(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getClientMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getContactName(), dataStyle);
                createCell(row, colNum++, dto.getRelationshipToClient(), dataStyle);
                createCell(row, colNum++, dto.getEmail(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Active Clients report to Excel
     */
    public byte[] exportActiveClients(List<ActiveClientDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Active Clients report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Active Clients");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Account Name", "Provider ID", "Client Medicaid ID", "Client Name", "Phone",
                "Address", "City", "State", "ZIP", "County", "Latitude", "Longitude", "Active Since"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (ActiveClientDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getAccountName(), dataStyle);
                createCell(row, colNum++, dto.getProviderId(), dataStyle);
                createCell(row, colNum++, dto.getClientMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getPhone(), dataStyle);
                createCell(row, colNum++, dto.getAddress(), dataStyle);
                createCell(row, colNum++, dto.getCity(), dataStyle);
                createCell(row, colNum++, dto.getState(), dataStyle);
                createCell(row, colNum++, dto.getZip(), dataStyle);
                createCell(row, colNum++, dto.getCounty(), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getLatitude()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getLongitude()), dataStyle);
                createCell(row, colNum++, formatDate(dto.getActiveSinceDate()), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Active Employees report to Excel
     */
    public byte[] exportActiveEmployees(List<ActiveEmployeeDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Active Employees report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Active Employees");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Account Name", "Employee ID", "Employee Name", "Email", "Phone", "Department"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (ActiveEmployeeDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getAccountName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeId(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeEmail(), dataStyle);
                createCell(row, colNum++, dto.getPhone(), dataStyle);
                createCell(row, colNum++, dto.getDepartment(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Call Listing report to Excel
     */
    public byte[] exportCallListing(List<CallListingDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Call Listing report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Call Listing");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Service ID", "Account Name", "Account ID", "Client ID", "Client Medicaid ID",
                "Client Name", "Phone", "Employee Name", "Employee ID", "Visit Date",
                "Start Time", "End Time", "Call In Time", "Call Out Time", "Visit Key",
                "Group Code", "Status", "Indicators"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (CallListingDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getServiceId(), dataStyle);
                createCell(row, colNum++, dto.getAccountName(), dataStyle);
                createCell(row, colNum++, dto.getAccountId(), dataStyle);
                createCell(row, colNum++, dto.getClientId(), dataStyle);
                createCell(row, colNum++, dto.getClientMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getPhone(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeId(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getVisitDate()), dataStyle);
                createCell(row, colNum++, dto.getStartTime() != null ? dto.getStartTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getEndTime() != null ? dto.getEndTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getCallInTime() != null ? dto.getCallInTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getCallOutTime() != null ? dto.getCallOutTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getVisitKey(), dataStyle);
                createCell(row, colNum++, dto.getGroupCode(), dataStyle);
                createCell(row, colNum++, dto.getStatus(), dataStyle);
                createCell(row, colNum++, dto.getIndicators(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Call Summary report to Excel
     */
    public byte[] exportCallSummary(List<CallSummaryDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Call Summary report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Call Summary");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Office ID", "Client ID", "Client Medicaid ID", "Client Name",
                "Employee Name", "Employee ID", "Visit Key", "Start Time", "End Time",
                "Calls Start", "Calls End", "Hours Total", "Units"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (CallSummaryDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getOfficeId(), dataStyle);
                createCell(row, colNum++, dto.getClientId(), dataStyle);
                createCell(row, colNum++, dto.getClientMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeId(), dataStyle);
                createCell(row, colNum++, dto.getVisitKey(), dataStyle);
                createCell(row, colNum++, dto.getStartTime() != null ? dto.getStartTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getEndTime() != null ? dto.getEndTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getCallsStart() != null ? dto.getCallsStart().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getCallsEnd() != null ? dto.getCallsEnd().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getHoursTotal() != null ? dto.getHoursTotal().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getUnits() != null ? dto.getUnits().toString() : "", dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Client Address Listing report to Excel
     */
    public byte[] exportClientAddressListing(List<ClientAddressListingDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Client Address Listing report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Client Address Listing");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Account ID", "Account Name", "Client Medicaid ID", "Client Name",
                "Tag", "Address Type", "Phone", "Address", "City", "State", "ZIP", "County"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (ClientAddressListingDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getAccountId(), dataStyle);
                createCell(row, colNum++, dto.getAccountName(), dataStyle);
                createCell(row, colNum++, dto.getClientMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getTag(), dataStyle);
                createCell(row, colNum++, dto.getAddressType(), dataStyle);
                createCell(row, colNum++, dto.getPhone(), dataStyle);
                createCell(row, colNum++, dto.getAddress(), dataStyle);
                createCell(row, colNum++, dto.getCity(), dataStyle);
                createCell(row, colNum++, dto.getState(), dataStyle);
                createCell(row, colNum++, dto.getZip(), dataStyle);
                createCell(row, colNum++, dto.getCounty(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Employee Attributes report to Excel
     */
    public byte[] exportEmployeeAttributes(List<EmployeeAttributesDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Employee Attributes report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Employee Attributes");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Employee Name", "Attribute Name", "Attribute Value"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (EmployeeAttributesDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, dto.getAttributeName(), dataStyle);
                createCell(row, colNum++, dto.getAttributeValue(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export GPS Distance Exception report to Excel
     */
    public byte[] exportGpsDistanceException(List<GpsDistanceExceptionDTO> data, String reportTitle) throws IOException {
        log.info("Exporting GPS Distance Exception report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("GPS Distance Exception");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Service ID", "Account Name", "Client Name", "Client Medicaid ID",
                "Employee Name", "Visit Date", "Start Time", "End Time",
                "Expected Distance (km)", "Actual Distance (km)", "Variance (km)", "Exception Reason"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (GpsDistanceExceptionDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getServiceId(), dataStyle);
                createCell(row, colNum++, dto.getAccountName(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getClientMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getVisitDate()), dataStyle);
                createCell(row, colNum++, dto.getStartTime() != null ? dto.getStartTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getEndTime() != null ? dto.getEndTime().toString() : "", dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getExpectedDistance()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getActualDistance()), dataStyle);
                createCell(row, colNum++, formatDecimal(dto.getVariance()), dataStyle);
                createCell(row, colNum++, dto.getExceptionReason(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Payer-Program-Service Listing report to Excel
     */
    public byte[] exportPayerProgramServiceListing(List<PayerProgramServiceListingDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Payer-Program-Service Listing report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Payer-Program-Service");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Payer Name", "Program Name", "Service Code", "Service Name"};
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (PayerProgramServiceListingDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getPayerName(), dataStyle);
                createCell(row, colNum++, dto.getProgramName(), dataStyle);
                createCell(row, colNum++, dto.getServiceCode(), dataStyle);
                createCell(row, colNum++, dto.getServiceName(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * Export Visit Listing report to Excel
     */
    public byte[] exportVisitListing(List<VisitListingDTO> data, String reportTitle) throws IOException {
        log.info("Exporting Visit Listing report with {} rows", data.size());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Visit Listing");
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "Payer ID", "Account Name", "Account ID", "Provider ID",
                "Client Medicaid ID", "Client Name", "Employee Name", "Employee ID",
                "Visit Date", "Start Time", "End Time", "Visit Key", "Status"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            int rowNum = 1;
            for (VisitListingDTO dto : data) {
                Row row = sheet.createRow(rowNum++);
                int colNum = 0;
                
                createCell(row, colNum++, dto.getPayerId(), dataStyle);
                createCell(row, colNum++, dto.getAccountName(), dataStyle);
                createCell(row, colNum++, dto.getAccountId(), dataStyle);
                createCell(row, colNum++, dto.getProviderId(), dataStyle);
                createCell(row, colNum++, dto.getClientMedicaidId(), dataStyle);
                createCell(row, colNum++, dto.getClientName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeName(), dataStyle);
                createCell(row, colNum++, dto.getEmployeeId(), dataStyle);
                createCell(row, colNum++, formatDate(dto.getVisitDate()), dataStyle);
                createCell(row, colNum++, dto.getStartTime() != null ? dto.getStartTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getEndTime() != null ? dto.getEndTime().toString() : "", dataStyle);
                createCell(row, colNum++, dto.getVisitKey(), dataStyle);
                createCell(row, colNum++, dto.getStatus(), dataStyle);
            }
            
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
}

