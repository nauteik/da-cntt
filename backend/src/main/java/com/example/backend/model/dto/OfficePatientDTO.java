package com.example.backend.model.dto;

import java.time.LocalDate;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple DTO for Patient information in Office context
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficePatientDTO {
    
    private UUID id;
    private String patientCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phone;
    private String email;
    private String status;
    private Boolean isActive;
}
