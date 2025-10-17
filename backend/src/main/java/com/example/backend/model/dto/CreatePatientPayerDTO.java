package com.example.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for creating patient payer
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientPayerDTO {

    @NotNull(message = "Payer ID is required")
    private UUID payerId;

    private Integer rank;

    private String groupNo;

    private LocalDate startDate;

    private LocalDate endDate;
}

