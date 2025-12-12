package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Expiring Authorizations report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpiringAuthReportDTO {
    
    private String clientName;
    private String clientType;
    private String medicaidId;
    private String alternatePayer;
    private String payer;
    private String program;
    private String service;
    private LocalDate startDate;
    private LocalDate endDate;
    private String authId;
    private BigDecimal authorizedUnits;
    private String limit;
    private BigDecimal available;
    private String jurisdiction;
    private Integer daysUntilExpiration;
}

