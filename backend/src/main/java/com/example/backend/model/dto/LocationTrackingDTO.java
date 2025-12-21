package com.example.backend.model.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for single location tracking point
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationTrackingDTO {
    private UUID id;
    private UUID serviceDeliveryId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal accuracy;
    private BigDecimal altitude;
    private OffsetDateTime recordedAt;
}
