package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for authorization search request with various filter parameters
 */
@Data
@NoArgsConstructor
public class AuthorizationSearchRequestDTO {
    
    // Date range filters
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Entity filters
    private UUID payerId;
    private UUID supervisorId;
    private UUID programId;
    private UUID serviceTypeId;
    
    // Text search filters
    private String authorizationNo;
    private String clientId;
    private String clientFirstName;
    private String clientLastName;
    
    // Status filter
    private String status; // ACTIVE, EXPIRED, PENDING, etc.
}

