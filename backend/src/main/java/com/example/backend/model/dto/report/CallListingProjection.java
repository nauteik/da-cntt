package com.example.backend.model.dto.report;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Projection interface for Call Listing report query results
 */
public interface CallListingProjection {
    String getServiceId();
    String getAccountName();
    String getAccountId();
    String getClientId();
    String getClientMedicaidId();
    String getClientName();
    String getPhone();
    String getEmployeeName();
    String getEmployeeId();
    LocalDate getVisitDate();
    LocalTime getStartTime();
    LocalTime getEndTime();
    LocalTime getCallInTime();
    LocalTime getCallOutTime();
    String getVisitKey();
    String getGroupCode();
    String getStatus();
    String getIndicators();
}
