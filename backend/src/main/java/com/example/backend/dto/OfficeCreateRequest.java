package com.example.backend.dto;

import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for creating a new office
 */
@Data
public class OfficeCreateRequest {

    @NotBlank(message = "Office code is required")
    @Size(max = 50, message = "Office code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Office name is required")
    @Size(max = 255, message = "Office name must not exceed 255 characters")
    private String name;

    private String county;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String timezone = "America/New_York";

    private UUID addressId;

    private Map<String, Object> billingConfig;
}
