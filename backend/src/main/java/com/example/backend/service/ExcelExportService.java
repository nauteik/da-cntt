package com.example.backend.service;

import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.report.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
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
}

