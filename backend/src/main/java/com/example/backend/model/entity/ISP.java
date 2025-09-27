package com.example.backend.model.entity;

import com.example.backend.model.enums.ISPStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * ISP (Individual Service Plan) entity
 */
@Entity
@Table(name = "isp", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "current_status"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "patient", "versions"})
public class ISP extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    private ISPStatus currentStatus = ISPStatus.DRAFT;

    // Relationships
    @OneToMany(mappedBy = "isp", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ISPVersion> versions = new HashSet<>();

    public ISP(Organization organization, Patient patient) {
        this.organization = organization;
        this.patient = patient;
    }

    // Helper methods
    public boolean isDraft() {
        return ISPStatus.DRAFT.equals(currentStatus);
    }

    public boolean isActive() {
        return ISPStatus.ACTIVE.equals(currentStatus);
    }

    public boolean isExpired() {
        return ISPStatus.EXPIRED.equals(currentStatus);
    }

    public ISPVersion getActiveVersion() {
        return versions.stream()
                .filter(version -> ISPStatus.ACTIVE.equals(version.getStatus()))
                .findFirst()
                .orElse(null);
    }

    public ISPVersion getLatestVersion() {
        return versions.stream()
                .max((v1, v2) -> Integer.compare(v1.getVersionNo(), v2.getVersionNo()))
                .orElse(null);
    }
}

