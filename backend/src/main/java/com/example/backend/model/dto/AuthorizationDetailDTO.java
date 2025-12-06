package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for authorization detail information
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationDetailDTO {
    
    private UUID authorizationId;
    
    private String authorizationNo;
    
    private String clientId;
    
    private String clientName;
    
    private String payerIdentifier;
    
    private String format;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private BigDecimal maxUnits;
    
    private String comments;
    
    private UUID patientId;
}

