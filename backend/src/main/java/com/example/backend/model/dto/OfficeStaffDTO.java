package com.example.backend.model.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple DTO for Staff information in Office context
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficeStaffDTO {
    
    private UUID id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String position;
    private String role;
    private LocalDate hireDate;
    private LocalDate releaseDate;
    private Boolean isActive;
    private String status;
}
