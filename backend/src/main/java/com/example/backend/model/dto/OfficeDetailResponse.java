package com.example.backend.model.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Detailed DTO for Office information including address and statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficeDetailResponse {
    
    private UUID id;
    private String code;
    private String name;
    private String county;
    private String phone;
    private String email;
    private String timezone;
    private Boolean isActive;
    
    // Address information
    private UUID addressId;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String zipCode;
    private String fullAddress;
    
    // Billing configuration
    private Map<String, Object> billingConfig;
    
    // Statistics
    private Integer totalStaff;
    private Integer activeStaff;
    private Integer totalPatients;
    private Integer activePatients;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
