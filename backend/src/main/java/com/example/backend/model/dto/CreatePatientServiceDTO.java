package com.example.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for creating a new patient service assignment.
 * Used for POST /api/patients/{id}/services
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientServiceDTO {

    @NotNull(message = "Service type ID is required")
    private UUID serviceTypeId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private Map<String, Object> meta;
}

