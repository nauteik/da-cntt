package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Vital reading entity for storing vital signs recorded from app
 */
@Entity
@Table(name = "vital_reading")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "patient", "staff"})
public class VitalReading extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(name = "measured_at", nullable = false)
    private LocalDateTime measuredAt;

    @Column(name = "systolic")
    private Integer systolic;

    @Column(name = "diastolic")
    private Integer diastolic;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "temperature_c", precision = 4, scale = 1)
    private BigDecimal temperatureC;

    @Column(name = "glucose", precision = 6, scale = 2)
    private BigDecimal glucose;

    @Column(name = "o2_sat")
    private Integer o2Sat;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta = new HashMap<>();

    public VitalReading(Organization organization, Patient patient, LocalDateTime measuredAt) {
        this.organization = organization;
        this.patient = patient;
        this.measuredAt = measuredAt;
    }

    // Helper methods
    public boolean hasBloodPressure() {
        return systolic != null && diastolic != null;
    }

    public boolean hasTemperature() {
        return temperatureC != null;
    }

    public boolean hasGlucose() {
        return glucose != null;
    }

    public boolean hasOxygenSaturation() {
        return o2Sat != null;
    }

    public boolean hasHeartRate() {
        return heartRate != null;
    }

    public boolean hasRespiratoryRate() {
        return respiratoryRate != null;
    }

    public String getBloodPressureReading() {
        if (!hasBloodPressure()) return null;
        return systolic + "/" + diastolic;
    }

    public boolean isHypertensive() {
        return hasBloodPressure() && (systolic >= 140 || diastolic >= 90);
    }

    public boolean isHypotensive() {
        return hasBloodPressure() && (systolic < 90 || diastolic < 60);
    }

    public boolean isFeverish() {
        return hasTemperature() && temperatureC.compareTo(new BigDecimal("37.5")) > 0;
    }

    public boolean isLowOxygen() {
        return hasOxygenSaturation() && o2Sat < 95;
    }
}
