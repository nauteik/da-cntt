package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO for batch upload of location points
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationTrackingBatchDTO {
    private UUID serviceDeliveryId;
    private List<LocationPointDTO> locations;
}
