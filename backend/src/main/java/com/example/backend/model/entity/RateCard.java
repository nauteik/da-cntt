package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Rate card entity for billing rates by service/staff/patient
 */
@Entity
@Table(name = "rate_card", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "name"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "entries"})
public class RateCard extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "scope", nullable = false)
    private String scope = "org";

    @Column(name = "effective_at", nullable = false)
    private LocalDate effectiveAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    // Relationships
    @OneToMany(mappedBy = "rateCard", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<RateEntry> entries = new HashSet<>();

    public RateCard(Organization organization, String name, String scope, LocalDate effectiveAt) {
        this.organization = organization;
        this.name = name;
        this.scope = scope;
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

    public boolean isOrganizationScope() {
        return "org".equals(scope);
    }

    public boolean isOfficeScope() {
        return "office".equals(scope);
    }
}

