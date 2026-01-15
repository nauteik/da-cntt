package com.example.backend.model.dto.report;

/**
 * Projection interface for Employee Attributes report query results
 */
public interface EmployeeAttributesProjection {
    String getEmployeeName();
    String getAttributeName();
    String getAttributeValue();
}
