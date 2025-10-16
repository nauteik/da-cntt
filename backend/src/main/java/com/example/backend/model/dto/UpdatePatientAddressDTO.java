package com.example.backend.model.dto;

import com.example.backend.model.enums.AddressType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating or updating patient addresses.
 * All fields are optional for PATCH semantics.
 * When creating a new address, required fields should be validated by the service layer.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientAddressDTO {

    @Size(max = 100, message = "Label must not exceed 100 characters")
    private String label;

    private AddressType type;

    @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
    private String line1;

    @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
    private String line2;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 2, message = "State must be 2 characters")
    private String state;

    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Postal code must be in format XXXXX or XXXXX-XXXX")
    @Size(max = 10, message = "Postal code must not exceed 10 characters")
    private String postalCode;

    @Size(max = 100, message = "County must not exceed 100 characters")
    private String county;

    @Pattern(regexp = "^(\\(\\d{3}\\)\\s?|\\d{3}-)\\d{3}-\\d{4}$", message = "Phone must be in format (XXX) XXX-XXXX or XXX-XXX-XXXX")
    private String phone;

    @Email(message = "Invalid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    private Boolean isMain;
}

