package com.example.backend.model.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for patient search results with basic info and main address
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientSearchResultDTO {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String medicaidId;
    private String clientId;
    private String status;
    
    // Main address info
    private UUID mainAddressId;
    private String addressLabel;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String phone;
    private String email;
    private Double latitude;
    private Double longitude;
    private String locationNotes;
}
