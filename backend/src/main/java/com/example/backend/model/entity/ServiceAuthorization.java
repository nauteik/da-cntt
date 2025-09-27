package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Service authorization entity for managing unit limits and consumption
 */
@Entity
@Table(name = "service_authorization")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"ispVersion", "organization", "serviceType", "payor", "unitConsumptions"})
public class ServiceAuthorization extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_version_id", nullable = false)
    @JsonIgnore
    private ISPVersion ispVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payor_id")
    private Payor payor;

    @Column(name = "units_authorized", nullable = false)
    private Integer unitsAuthorized;

    @Column(name = "period", nullable = false)
    private String period;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "allocation", columnDefinition = "jsonb")
    private Map<String, Object> allocation = new HashMap<>();

    @Column(name = "effective_at", nullable = false)
    private LocalDate effectiveAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    // Relationships
    @OneToMany(mappedBy = "serviceAuthorization", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<UnitConsumption> unitConsumptions = new HashSet<>();

    public ServiceAuthorization(ISPVersion ispVersion, Organization organization, Integer unitsAuthorized, String period, LocalDate effectiveAt) {
        this.ispVersion = ispVersion;
        this.organization = organization;
        this.unitsAuthorized = unitsAuthorized;
        this.period = period;
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

    public int getUnitsUsed() {
        return unitConsumptions.stream()
                .mapToInt(UnitConsumption::getUnitsUsed)
                .sum();
    }

    public int getUnitsRemaining() {
        return Math.max(0, unitsAuthorized - getUnitsUsed());
    }

    public boolean hasUnitsAvailable() {
        return getUnitsRemaining() > 0;
    }
}

