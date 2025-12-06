package com.example.backend.model.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating patient address with GPS location
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientAddressLocationDTO {

    @Size(max = 100, message = "Label must not exceed 100 characters")
    private String label;

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

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @Size(max = 500, message = "Location notes must not exceed 500 characters")
    private String locationNotes;

    private Boolean isMain;
}
