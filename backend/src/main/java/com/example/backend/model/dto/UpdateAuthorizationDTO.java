package com.example.backend.model.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAuthorizationDTO {
    
    private UUID patientServiceId;
    
    private UUID patientPayerId;
    
    private String authorizationNo;
    
    private String eventCode;
    
    private String format;
    
    @DecimalMin(value = "0.0", message = "Max units must be non-negative")
    private BigDecimal maxUnits;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String comments;
}

