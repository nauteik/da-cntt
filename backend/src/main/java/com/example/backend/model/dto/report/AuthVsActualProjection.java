package com.example.backend.model.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projection interface for Authorization vs Actual report query results
 */
public interface AuthVsActualProjection {
    String getClientName();
    String getClientType();
    String getMedicaidId();
    String getAlternatePayer();
    String getPayer();
    String getProgram();
    String getService();
    LocalDate getAuthStartDate();
    LocalDate getAuthEndDate();
    String getAuthId();
    BigDecimal getAuthorizedUnits();
    BigDecimal getUsedUnits();
    BigDecimal getAvailableUnits();
    String getLimitType();
    String getJurisdiction();
}

