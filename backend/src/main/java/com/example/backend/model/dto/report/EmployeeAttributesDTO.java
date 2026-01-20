package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Employee Attributes report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAttributesDTO {
    
    private String employeeName;
    private String attributeName;
    private String attributeValue;
}
