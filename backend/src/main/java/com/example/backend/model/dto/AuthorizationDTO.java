package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
public class AuthorizationDTO {

    private String payerIdentifier;

    private String serviceCode;

    private String authorizationNo;

    private String eventCode;

    private Map<String, Object> modifiers;

    private String format;

    private LocalDate startDate;

    private LocalDate endDate;

    private String comments;

    private BigDecimal maxUnits;

    private BigDecimal totalUsed;

    private BigDecimal totalMissed;

    private BigDecimal totalRemaining;

    private Map<String, Object> meta;
}


