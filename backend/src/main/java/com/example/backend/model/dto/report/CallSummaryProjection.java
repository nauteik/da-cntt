package com.example.backend.model.dto.report;

import java.time.LocalTime;

/**
 * Projection interface for Call Summary report query results
 */
public interface CallSummaryProjection {
    String getOfficeId();
    String getClientId();
    String getClientMedicaidId();
    String getClientName();
    String getEmployeeName();
    String getEmployeeId();
    String getVisitKey();
    LocalTime getStartTime();
    LocalTime getEndTime();
    Integer getCallsStart();
    Integer getCallsEnd();
    Double getHoursTotal();
    Integer getUnits();
}
