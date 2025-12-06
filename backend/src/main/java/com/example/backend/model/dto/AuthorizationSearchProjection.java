package com.example.backend.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Interface projection for authorization search results
 * Used with native queries to avoid ClassCastException with date types
 */
public interface AuthorizationSearchProjection {
    UUID getAuthorizationId();
    String getAuthorizationNo();
    String getClientId();
    String getClientFirstName();
    String getClientLastName();
    String getClientName();
    String getPayerName();
    String getPayerIdentifier();
    String getSupervisorName();
    String getProgramIdentifier();
    String getServiceCode();
    String getServiceName();
    LocalDate getStartDate();
    LocalDate getEndDate();
    BigDecimal getMaxUnits();
    BigDecimal getTotalUsed();
    BigDecimal getTotalRemaining();
    String getFormat();
    String getStatus();
}

