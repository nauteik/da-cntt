package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for Role entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleDTO {

    private UUID id;
    private String code;
    private String name;
    private String description;
    private Boolean isSystem;
}
