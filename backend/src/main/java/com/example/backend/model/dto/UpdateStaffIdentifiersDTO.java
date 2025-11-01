package com.example.backend.model.dto;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.PastOrPresent;
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

    @NotBlank(message = "SSN is required")
    @Pattern(regexp = "^\\d{3}-?\\d{2}-?\\d{4}$", message = "SSN must be in format XXX-XX-XXXX")
    @Size(max = 11, message = "SSN must not exceed 11 characters")
    private String ssn;

    @NotBlank(message = "Employee ID is required")
    @Size(max = 50, message = "Employee ID must not exceed 50 characters")
    private String employeeId;

    @Size(max = 50, message = "National Provider ID must not exceed 50 characters")
    private String nationalProviderId;

    private Boolean isSupervisor;

    @NotBlank(message = "Position is required")
    @Size(max = 100, message = "Position must not exceed 100 characters")
    private String position;

    private UUID supervisorId;

    private UUID officeId;

    @PastOrPresent(message = "Effective date must be in the past or today")
    private LocalDate effectiveDate;

    @NotNull(message = "Hire date is required")
    @PastOrPresent(message = "Hire date must be in the past or today")
    private LocalDate hireDate;

    @NotNull(message = "Status is required")
    private Boolean isActive;
}
