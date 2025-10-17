package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for service type select dropdown
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceTypeSelectDTO {

    private UUID id;

    private String code;

    private String name;

    /**
     * Get display text formatted as "CODE - NAME"
     */
    public String getDisplayText() {
        return code + " - " + name;
    }
}

