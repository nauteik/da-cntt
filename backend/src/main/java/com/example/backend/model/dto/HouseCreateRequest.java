package com.example.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for creating a new house
 */
@Data
public class HouseCreateRequest {

    @NotNull(message = "Office ID is required")
    private UUID officeId;

    @NotBlank(message = "House code is required")
    @Size(max = 50, message = "House code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "House name is required")
    @Size(max = 255, message = "House name must not exceed 255 characters")
    private String name;

    private UUID addressId;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;
}




