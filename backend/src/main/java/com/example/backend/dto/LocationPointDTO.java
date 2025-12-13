package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO for individual location point in batch
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationPointDTO {
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal accuracy;
    private BigDecimal altitude;
    private OffsetDateTime recordedAt;
}
