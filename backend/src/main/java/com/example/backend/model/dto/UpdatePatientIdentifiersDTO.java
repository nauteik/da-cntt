package com.example.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating patient identifiers.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientIdentifiersDTO {

    @NotBlank(message = "Client ID is required")
    @Size(max = 50, message = "Client ID must not exceed 50 characters")
    private String clientId;

    @NotBlank(message = "Medicaid ID is required")
    @Pattern(regexp = "^\\d+$", message = "Medicaid ID must contain only numbers")
    @Size(max = 50, message = "Medicaid ID must not exceed 50 characters")
    private String medicaidId;

    @Pattern(regexp = "^\\d{3}-?\\d{2}-?\\d{4}$", message = "SSN must be in format XXX-XX-XXXX")
    @Size(max = 11, message = "SSN must not exceed 11 characters")
    private String ssn;

    @Pattern(regexp = "^\\d+$", message = "Agency ID must contain only numbers")
    @Size(max = 50, message = "Agency ID must not exceed 50 characters")
    private String agencyId;
}
