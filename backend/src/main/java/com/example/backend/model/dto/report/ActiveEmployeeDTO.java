package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Active Employees report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveEmployeeDTO {
    
    private String accountName;
    private String employeeId;
    private String employeeName;
    private String employeeEmail;
    private String phone;
    private String department;
    private Long totalEmployees;
}
