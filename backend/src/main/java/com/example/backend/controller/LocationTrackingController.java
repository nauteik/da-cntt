package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.model.ApiResponse;
import com.example.backend.service.LocationTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/location-tracking")
@RequiredArgsConstructor
public class LocationTrackingController {
    
    private final LocationTrackingService locationTrackingService;
    
    /**
     * Upload multiple location points in batch (recommended for mobile apps)
     */
    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<LocationTrackingDTO>>> uploadBatchLocationPoints(
        @RequestBody LocationTrackingBatchDTO batchDTO
    ) {
        try {
            List<LocationTrackingDTO> results = locationTrackingService.saveBatchLocationPoints(batchDTO);
            return ResponseEntity.ok(ApiResponse.success(results, results.size() + " location points saved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * Get journey summary with route and statistics
     */
    @GetMapping("/journey/{serviceDeliveryId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<JourneySummaryDTO>> getJourneySummary(
        @PathVariable UUID serviceDeliveryId
    ) {
        try {
            JourneySummaryDTO summary = locationTrackingService.getJourneySummary(serviceDeliveryId);
            return ResponseEntity.ok(ApiResponse.success(summary, "Journey summary retrieved successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
