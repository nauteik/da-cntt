package com.example.backend.model.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for patient selection in dropdowns/forms
 */
@Data
@Builder
public class PatientSelectDTO {
    private UUID id;
    private String displayName; // Format: "lastName, firstName (medicaidId)" or "clientId"
    private String firstName;
    private String lastName;
    private String medicaidId;
    private String clientId;
}

