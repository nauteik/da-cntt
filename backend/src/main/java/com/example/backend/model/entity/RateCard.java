package com.example.backend.model.entity;
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
    @UniqueConstraint(columnNames = {"name"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"entries"})
public class RateCard extends BaseEntity {

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

    public RateCard(String name, String scope, LocalDate effectiveAt) {
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

