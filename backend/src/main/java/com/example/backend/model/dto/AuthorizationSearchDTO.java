package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for authorization search results with related entity information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationSearchDTO {
    
    private UUID authorizationId;
    private String authorizationNo;
    
    // Client information
    private String clientId;
    private String clientFirstName;
    private String clientLastName;
    private String clientName; // Concatenated first + last name
    
    // Related entity names
    private String payerName;
    private String payerIdentifier;
    private String supervisorName;
    private String programIdentifier;
    private String serviceCode;
    private String serviceName;
    
    // Authorization details
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal maxUnits;
    private BigDecimal totalUsed;
    private BigDecimal totalRemaining;
    private String format; // e.g., "units"
    private String status; // ACTIVE, EXPIRED, PENDING
}

