package com.example.backend.model.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for staff selection in dropdowns/forms
 */
@Data
@Builder
public class StaffSelectDTO {
    private UUID id;
    private String displayName; // Format: "fullName (employeeCode) - officeName"
}

