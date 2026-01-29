package com.example.backend.model.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for dashboard alerts (expiring authorizations, certifications, incomplete shifts, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDTO {
    
    private String id;
    
    /**
     * Alert type: AUTHORIZATION_EXPIRING, CERTIFICATION_EXPIRING, INCOMPLETE_SHIFT
     */
    private String type;
    
    /**
     * Severity: high, medium, low
     */
    private String severity;
    
    private String message;
    private String entity;
    private LocalDate expiryDate;
    private Integer daysUntilExpiry;
    
    // Additional fields for context
    private String patientName;
    private String authorizationNo;
    private String serviceType;
}
