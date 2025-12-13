package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.model.entity.LocationTracking;
import com.example.backend.model.entity.ServiceDelivery;
import com.example.backend.repository.LocationTrackingRepository;
import com.example.backend.repository.ServiceDeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationTrackingService {
    
    private final LocationTrackingRepository locationTrackingRepository;
    private final ServiceDeliveryRepository serviceDeliveryRepository;
    
    /**
     * Save multiple location points in batch (more efficient than single saves)
     */
    @Transactional
    public List<LocationTrackingDTO> saveBatchLocationPoints(LocationTrackingBatchDTO batchDTO) {
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(batchDTO.getServiceDeliveryId())
            .orElseThrow(() -> new IllegalArgumentException("Service Delivery not found: " + batchDTO.getServiceDeliveryId()));
        
        // Check if tracking is enabled
        if (serviceDelivery.getTrackingEnabled() != null && !serviceDelivery.getTrackingEnabled()) {
            throw new IllegalStateException("Location tracking is disabled for this service");
        }
        
        List<LocationTracking> trackingList = batchDTO.getLocations().stream()
            .map(dto -> LocationTracking.builder()
                .serviceDelivery(serviceDelivery)
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .accuracy(dto.getAccuracy())
                .altitude(dto.getAltitude())
                .recordedAt(dto.getRecordedAt() != null ? dto.getRecordedAt() : OffsetDateTime.now())
                .build())
            .collect(Collectors.toList());
        
        List<LocationTracking> saved = locationTrackingRepository.saveAll(trackingList);
        log.info("Saved {} location points for service delivery: {}", saved.size(), batchDTO.getServiceDeliveryId());
        
        return saved.stream().map(this::toDTO).collect(Collectors.toList());
    }
    
    /**
     * Calculate total distance traveled using Haversine formula
     */
    public BigDecimal calculateTotalDistance(List<LocationTracking> points) {
        if (points == null || points.size() < 2) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal totalDistance = BigDecimal.ZERO;
        
        for (int i = 0; i < points.size() - 1; i++) {
            LocationTracking p1 = points.get(i);
            LocationTracking p2 = points.get(i + 1);
            
            BigDecimal distance = haversineDistance(
                p1.getLatitude(), p1.getLongitude(),
                p2.getLatitude(), p2.getLongitude()
            );
            
            totalDistance = totalDistance.add(distance);
        }
        
        return totalDistance.setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Haversine formula to calculate distance between two GPS coordinates
     * Returns distance in meters
     */
    private BigDecimal haversineDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        final double EARTH_RADIUS = 6371000; // meters
        
        double dLat = Math.toRadians(lat2.subtract(lat1).doubleValue());
        double dLon = Math.toRadians(lon2.subtract(lon1).doubleValue());
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1.doubleValue())) * 
                   Math.cos(Math.toRadians(lat2.doubleValue())) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = EARTH_RADIUS * c;
        
        return BigDecimal.valueOf(distance);
    }
    
    /**
     * Get journey summary with route and statistics
     */
    @Transactional(readOnly = true)
    public JourneySummaryDTO getJourneySummary(UUID serviceDeliveryId) {
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(serviceDeliveryId)
            .orElseThrow(() -> new IllegalArgumentException("Service Delivery not found: " + serviceDeliveryId));
        
        List<LocationTracking> points = locationTrackingRepository.findByServiceDeliveryIdOrderByRecordedAtAsc(serviceDeliveryId);
        
        if (points.isEmpty()) {
            return JourneySummaryDTO.builder()
                .serviceDeliveryId(serviceDeliveryId)
                .totalDistanceMeters(BigDecimal.ZERO)
                .totalDistanceFormatted("0 m")
                .totalPoints(0)
                .route(new ArrayList<>())
                .build();
        }
        
        // Calculate total distance
        BigDecimal totalDistance = calculateTotalDistance(points);
        
        // Update service delivery with total distance
        serviceDelivery.setTotalDistanceMeters(totalDistance);
        serviceDeliveryRepository.save(serviceDelivery);
        
        // Calculate duration
        OffsetDateTime startTime = points.get(0).getRecordedAt();
        OffsetDateTime endTime = points.get(points.size() - 1).getRecordedAt();
        long durationMinutes = ChronoUnit.MINUTES.between(startTime, endTime);
        
        return JourneySummaryDTO.builder()
            .serviceDeliveryId(serviceDeliveryId)
            .totalDistanceMeters(totalDistance)
            .totalDistanceFormatted(formatDistance(totalDistance))
            .totalPoints(points.size())
            .startTime(startTime)
            .endTime(endTime)
            .durationMinutes(durationMinutes)
            .route(points.stream().map(this::toDTO).collect(Collectors.toList()))
            .build();
    }
    
    /**
     * Format distance for display
     */
    private String formatDistance(BigDecimal meters) {
        if (meters.compareTo(BigDecimal.valueOf(1000)) >= 0) {
            BigDecimal km = meters.divide(BigDecimal.valueOf(1000), 2, RoundingMode.HALF_UP);
            return km + " km";
        }
        return meters.setScale(0, RoundingMode.HALF_UP) + " m";
    }
    
    /**
     * Convert entity to DTO
     */
    private LocationTrackingDTO toDTO(LocationTracking entity) {
        return LocationTrackingDTO.builder()
            .id(entity.getId())
            .serviceDeliveryId(entity.getServiceDelivery().getId())
            .latitude(entity.getLatitude())
            .longitude(entity.getLongitude())
            .accuracy(entity.getAccuracy())
            .altitude(entity.getAltitude())
            .recordedAt(entity.getRecordedAt())
            .build();
    }
}
