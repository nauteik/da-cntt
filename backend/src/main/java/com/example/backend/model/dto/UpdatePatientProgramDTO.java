package com.example.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for updating patient program information.
 * Used for PATCH /api/patients/{id}/program
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientProgramDTO {

    @NotNull(message = "Program ID is required")
    private UUID programId;

    private UUID supervisorId;

    private LocalDate enrollmentDate;

    @NotNull(message = "Status effective date is required")
    private LocalDate statusEffectiveDate;

    private LocalDate socDate;

    private LocalDate eocDate;

    private LocalDate eligibilityBeginDate;

    private LocalDate eligibilityEndDate;

    private String reasonForChange;
}

