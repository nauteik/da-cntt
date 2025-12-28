package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for House information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseDTO {
    private UUID id;
    private UUID officeId;
    private String officeName;
    private String code;
    private String name;
    private String description;
    private Boolean isActive;
    
    // Address information
    private UUID addressId;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String fullAddress;
    
    // Current patient information
    private UUID currentPatientId;
    private String currentPatientName;
    private UUID currentStayId;
}





