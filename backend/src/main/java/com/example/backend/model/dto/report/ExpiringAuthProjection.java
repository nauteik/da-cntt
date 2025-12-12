package com.example.backend.model.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projection interface for Expiring Authorizations report query results
 */
public interface ExpiringAuthProjection {
    String getClientName();
    String getClientType();
    String getMedicaidId();
    String getAlternatePayer();
    String getPayer();
    String getProgram();
    String getService();
    LocalDate getStartDate();
    LocalDate getEndDate();
    String getAuthId();
    BigDecimal getAuthorizedUnits();
    String getLimit();
    BigDecimal getAvailable();
    String getJurisdiction();
    Integer getDaysUntilExpiration();
}

