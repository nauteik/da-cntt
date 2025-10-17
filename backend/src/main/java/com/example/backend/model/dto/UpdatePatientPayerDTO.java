package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for updating patient payer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientPayerDTO {

    private UUID payerId;

    private Integer rank;

    private String groupNo;

    private LocalDate startDate;

    private LocalDate endDate;
}

