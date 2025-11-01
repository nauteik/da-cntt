package com.example.backend.dto;

import java.util.Map;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for updating an existing office
 */
@Data
public class OfficeUpdateRequest {

    @Size(max = 255, message = "Office name must not exceed 255 characters")
    private String name;

    private String county;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @Email(message = "Invalid email format")
    private String email;

    private String timezone;

    private UUID addressId;

    private Map<String, Object> billingConfig;

    private Boolean isActive;
}
