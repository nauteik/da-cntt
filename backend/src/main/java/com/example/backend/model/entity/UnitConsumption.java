package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Unit consumption entity for tracking unit usage against authorizations
 */
@Entity
@Table(name = "unit_consumption")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"authorization"})
public class UnitConsumption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_id", nullable = false)
    @JsonIgnore
    private Authorization authorization;

    @Column(name = "source_type", nullable = false)
    private String sourceType;

    @Column(name = "source_id")
    private UUID sourceId;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "units_used", nullable = false)
    private Integer unitsUsed;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    public UnitConsumption(Authorization authorization, 
                          String sourceType, UUID sourceId, LocalDate serviceDate, Integer unitsUsed) {
        this.authorization = authorization;
        this.sourceType = sourceType;
        this.sourceId = sourceId;
        this.serviceDate = serviceDate;
        this.unitsUsed = unitsUsed;
    }

    // Helper methods
    public boolean isFromServiceDelivery() {
        return "service_delivery".equals(sourceType);
    }

    public boolean isFromScheduleShift() {
        return "schedule_shift".equals(sourceType);
    }
}

