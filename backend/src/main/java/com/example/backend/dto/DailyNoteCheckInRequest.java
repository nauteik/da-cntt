package com.example.backend.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request DTO for checking in to a daily note
 */
@Data
public class DailyNoteCheckInRequest {

    @NotNull(message = "Daily note ID is required")
    private UUID dailyNoteId;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String address;

    private String notes;
}
