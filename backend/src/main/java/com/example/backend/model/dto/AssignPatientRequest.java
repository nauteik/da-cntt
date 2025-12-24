package com.example.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for assigning a patient to a house
 */
@Data
public class AssignPatientRequest {

    @NotNull(message = "Patient ID is required")
    private UUID patientId;

    @NotNull(message = "Move in date is required")
    private LocalDate moveInDate;
}




