package com.example.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating staff emergency contacts.
 * All fields are optional for PATCH semantics.
 * When creating a new contact, required fields should be validated by the service layer.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStaffContactDTO {

    @Size(max = 100, message = "Relation must not exceed 100 characters")
    private String relation;

    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Pattern(regexp = "^(\\(\\d{3}\\)\\s?\\d{3}-\\d{4}|\\d{3}-\\d{3}-\\d{4})$", message = "Phone must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX")
    private String phone;
    
    @Email(message = "Invalid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    private String line1;

    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String line2;

    private Boolean isPrimary;
}
