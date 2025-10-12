package com.example.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating a new patient based on form input.
 * Uses identifiers for Program and Payer for decoupling.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientDTO {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Program identifier is required")
    @Size(max = 50, message = "Program identifier must not exceed 50 characters")
    private String programIdentifier;

    @NotBlank(message = "Payer identifier is required")
    @Size(max = 50, message = "Payer identifier must not exceed 50 characters")
    private String payerIdentifier;

    @NotBlank(message = "Medicaid ID is required")
    @Size(max = 50, message = "Medicaid ID must not exceed 50 characters")
    private String medicaidId;

    @Pattern(regexp = "^(\\+\\d{1,2}\\s)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$", message = "Invalid phone number format")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    // Office ID is optional and can be inferred from the authenticated user's context if not provided.
    private UUID officeId;
}
