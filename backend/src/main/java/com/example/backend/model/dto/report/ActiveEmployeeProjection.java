package com.example.backend.model.dto.report;

/**
 * Projection interface for Active Employees report query results
 */
public interface ActiveEmployeeProjection {
    String getAccountName();
    String getEmployeeId();
    String getEmployeeName();
    String getEmployeeEmail();
    String getPhone();
    String getDepartment();
}
