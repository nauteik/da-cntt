package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for authorization display in payer form
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayerAuthorizationDTO {

    private String serviceCode;

    private String authorizationNo;

    private String format;

    private BigDecimal maxUnits;

    private LocalDate startDate;

    private LocalDate endDate;
}

