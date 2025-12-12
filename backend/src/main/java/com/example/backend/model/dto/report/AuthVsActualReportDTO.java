package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Authorization vs Actual Used by Client report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthVsActualReportDTO {
    
    private String clientName;
    private String clientType;
    private String medicaidId;
    private String alternatePayer;
    private String payer;
    private String program;
    private String service;
    private LocalDate authStartDate;
    private LocalDate authEndDate;
    private String authId;
    private BigDecimal authorizedUnits;
    private BigDecimal usedUnits;
    private BigDecimal availableUnits;
    private String limitType;
    private String jurisdiction;
}

