package com.example.backend.model.dto.report;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Projection interface for Visit Listing report query results
 */
public interface VisitListingProjection {
    String getPayerId();
    String getAccountName();
    String getAccountId();
    String getProviderId();
    String getClientMedicaidId();
    String getClientName();
    String getEmployeeName();
    String getEmployeeId();
    LocalDate getVisitDate();
    LocalTime getStartTime();
    LocalTime getEndTime();
    String getVisitKey();
    String getStatus();
}
