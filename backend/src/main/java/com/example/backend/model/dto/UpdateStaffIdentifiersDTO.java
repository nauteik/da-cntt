package com.example.backend.model.dto;

import java.util.UUID;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for partially updating staff identifiers.
 * All fields are optional - only provided fields will be updated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStaffIdentifiersDTO {

    @Pattern(regexp = "^\\d{3}-?\\d{2}-?\\d{4}$", message = "SSN must be in format XXX-XX-XXXX")
    @Size(max = 11, message = "SSN must not exceed 11 characters")
    private String ssn;

    @Size(max = 50, message = "Employee ID must not exceed 50 characters")
    private String employeeId;

    @Size(max = 50, message = "National Provider ID must not exceed 50 characters")
    private String nationalProviderId;

    private Boolean isSupervisor;

    @Size(max = 100, message = "Position must not exceed 100 characters")
    private String position;

    private UUID supervisorId;

    private UUID officeId;
}
