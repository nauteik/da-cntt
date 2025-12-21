package com.example.backend.model.entity;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a GPS location tracking point during service delivery
 */
@Entity
@Table(name = "location_tracking", indexes = {
    @Index(name = "idx_location_service_delivery", columnList = "service_delivery_id"),
    @Index(name = "idx_location_recorded_at", columnList = "recorded_at"),
    @Index(name = "idx_location_composite", columnList = "service_delivery_id, recorded_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationTracking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_delivery_id", nullable = false)
    private ServiceDelivery serviceDelivery;
    
    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal latitude;
    
    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal longitude;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal accuracy; // meters
    
    @Column(precision = 10, scale = 2)
    private BigDecimal altitude; // meters
    
    @Column(name = "recorded_at", nullable = false)
    private OffsetDateTime recordedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
