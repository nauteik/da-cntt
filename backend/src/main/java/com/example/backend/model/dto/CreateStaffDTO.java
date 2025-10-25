package com.example.backend.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for creating a new staff member.
 * Creates both Staff entity and associated AppUser account.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateStaffDTO {

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotNull(message = "Office is required")
    private UUID officeId;

    @NotNull(message = "Role is required")
    private UUID roleId;

    @NotBlank(message = "SSN is required")
    @Pattern(regexp = "^\\d{3}-?\\d{2}-?\\d{4}$", message = "SSN must be in format XXX-XX-XXXX")
    @Size(max = 11, message = "SSN must not exceed 11 characters")
    private String ssn;

    @Pattern(regexp = "^(\\+\\d{1,2}\\s)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$", message = "Invalid phone number format")
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @Size(max = 50, message = "National Provider ID must not exceed 50 characters")
    private String nationalProviderId;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    // TODO: Consult partner about employeeId generation strategy (auto vs manual)
    // For now, employeeId will be auto-generated based on office and sequence
}
