package com.example.backend.model.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

/**
 * DTO for updating an existing house
 */
@Data
public class HouseUpdateRequest {

    @Size(max = 50, message = "House code must not exceed 50 characters")
    private String code;

    @Size(max = 255, message = "House name must not exceed 255 characters")
    private String name;

    private UUID addressId;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private Boolean isActive;
}





