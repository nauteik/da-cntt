package com.example.backend.model.dto.report;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Projection interface for GPS Distance Exception report query results
 */
public interface GpsDistanceExceptionProjection {
    String getServiceId();
    String getAccountName();
    String getClientName();
    String getClientMedicaidId();
    String getEmployeeName();
    LocalDate getVisitDate();
    LocalTime getStartTime();
    LocalTime getEndTime();
    BigDecimal getExpectedDistance();
    BigDecimal getActualDistance();
    BigDecimal getVariance();
    String getExceptionReason();
}
