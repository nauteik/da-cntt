package com.example.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating patient status.
 * Used for PATCH /api/patients/{id}/status
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientStatusDTO {

    @NotNull(message = "Status is required")
    private String status; // ACTIVE, INACTIVE, or PENDING
}
