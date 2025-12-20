package com.example.backend.model.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for checking in to a service delivery
 */
@Data
public class ServiceDeliveryCheckInRequest {

    @NotNull(message = "Service delivery ID is required")
    private UUID serviceDeliveryId;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;

    private String notes;
}
