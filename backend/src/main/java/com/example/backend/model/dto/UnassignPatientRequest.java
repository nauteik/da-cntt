package com.example.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO for unassigning a patient from a house
 */
@Data
public class UnassignPatientRequest {

    @NotNull(message = "Move out date is required")
    private LocalDate moveOutDate;
}





