package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for journey summary with route and statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JourneySummaryDTO {
    private UUID serviceDeliveryId;
    private BigDecimal totalDistanceMeters;
    private String totalDistanceFormatted; // "1.5 km" or "250 m"
    private Integer totalPoints;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Long durationMinutes;
    private List<LocationTrackingDTO> route;
}
