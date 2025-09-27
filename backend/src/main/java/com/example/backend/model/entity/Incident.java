package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Incident entity for incident reporting management
 */
@Entity
@Table(name = "incident")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "office", "patient", "reportedByStaff", "evidenceFile", "parties"})
public class Incident extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by_staff_id")
    private Staff reportedByStaff;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "type", nullable = false)
    private String type;

    @Column(name = "severity")
    private String severity;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false)
    private String status = "draft";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_file_id")
    private FileObject evidenceFile;

    // Relationships
    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<IncidentParty> parties = new HashSet<>();

    @OneToMany(mappedBy = "incident", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<FireDrillIssue> fireDrillIssues = new HashSet<>();

    public Incident(Organization organization, LocalDateTime occurredAt, String type) {
        this.organization = organization;
        this.occurredAt = occurredAt;
        this.type = type;
    }

    // Helper methods
    public boolean isDraft() {
        return "draft".equals(status);
    }

    public boolean isReported() {
        return "reported".equals(status);
    }

    public boolean isUnderInvestigation() {
        return "investigating".equals(status);
    }

    public boolean isClosed() {
        return "closed".equals(status);
    }

    public boolean isLowSeverity() {
        return "low".equals(severity);
    }

    public boolean isMediumSeverity() {
        return "medium".equals(severity);
    }

    public boolean isHighSeverity() {
        return "high".equals(severity);
    }

    public boolean isCriticalSeverity() {
        return "critical".equals(severity);
    }

    public boolean hasEvidence() {
        return evidenceFile != null;
    }

    public boolean isPatientIncident() {
        return patient != null;
    }

    public boolean isMedicalIncident() {
        return "medical".equals(type);
    }

    public boolean isBehavioralIncident() {
        return "behavioral".equals(type);
    }

    public boolean isAccidentIncident() {
        return "accident".equals(type);
    }

    public boolean isSafetyIncident() {
        return "safety".equals(type);
    }

    public boolean isPropertyIncident() {
        return "property".equals(type);
    }

    public void report() {
        this.status = "reported";
    }

    public void startInvestigation() {
        this.status = "investigating";
    }

    public void close() {
        this.status = "closed";
    }
}
