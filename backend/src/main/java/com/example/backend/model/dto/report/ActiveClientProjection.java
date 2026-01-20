package com.example.backend.model.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Projection interface for Active Clients report query results
 */
public interface ActiveClientProjection {
    String getAccountName();
    String getProviderId();
    String getClientMedicaidId();
    String getClientName();
    String getPhone();
    String getAddress();
    String getCity();
    String getState();
    String getZip();
    String getCounty();
    BigDecimal getLatitude();
    BigDecimal getLongitude();
    LocalDate getActiveSinceDate();
}
