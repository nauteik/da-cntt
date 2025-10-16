package com.example.backend.model.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for program selection in dropdowns/forms
 */
@Data
@Builder
public class ProgramSelectDTO {
    private UUID id;
    private String programIdentifier;
}

