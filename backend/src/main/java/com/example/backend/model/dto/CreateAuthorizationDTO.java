package com.example.backend.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAuthorizationDTO {
    
    @NotNull(message = "Patient service ID is required")
    private UUID patientServiceId;
    
    @NotNull(message = "Patient payer ID is required")
    private UUID patientPayerId;
    
    @NotBlank(message = "Authorization number is required")
    private String authorizationNo;
    
    private String eventCode;
    
    private String format = "units";
    
    @NotNull(message = "Max units is required")
    @DecimalMin(value = "0.0", message = "Max units must be non-negative")
    private BigDecimal maxUnits;
    
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String comments;
}

