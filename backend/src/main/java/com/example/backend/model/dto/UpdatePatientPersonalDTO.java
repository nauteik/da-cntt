package com.example.backend.model.dto;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for partially updating patient personal information.
 * All fields are optional - only provided fields will be updated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientPersonalDTO {

    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dob;

    /**
     * Gender as a string for backward compatibility with frontend forms.
     * Will be validated against Gender enum in service layer.
     * Accepts "Male" or "Female" values.
     */
    @Size(max = 20, message = "Gender must not exceed 20 characters")
    private String gender;

    @Size(max = 50, message = "Primary language must not exceed 50 characters")
    private String primaryLanguage;
}
