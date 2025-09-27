package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Staff rate entity for salary/rates linked to payroll and billing
 */
@Entity
@Table(name = "staff_rate")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "staff", "serviceType"})
public class StaffRate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @Column(name = "pay_basis", nullable = false)
    private String payBasis = "per_unit";

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "effective_at", nullable = false)
    private LocalDate effectiveAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    public StaffRate(Organization organization, Staff staff, String payBasis, BigDecimal hourlyRate, LocalDate effectiveAt) {
        this.organization = organization;
        this.staff = staff;
        this.payBasis = payBasis;
        this.hourlyRate = hourlyRate;
        this.effectiveAt = effectiveAt;
    }

    // Helper methods
    public boolean isActive() {
        LocalDate now = LocalDate.now();
        return !effectiveAt.isAfter(now) && (expiresAt == null || expiresAt.isAfter(now));
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDate.now());
    }

    public boolean isEffectiveOn(LocalDate date) {
        return !effectiveAt.isAfter(date) && (expiresAt == null || expiresAt.isAfter(date));
    }
}

