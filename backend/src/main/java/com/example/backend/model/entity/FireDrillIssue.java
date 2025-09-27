package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Fire drill issue entity for issues that arise during drill, can escalate to incident
 */
@Entity
@Table(name = "fire_drill_issue")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"fireDrill", "incident"})
public class FireDrillIssue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fire_drill_id", nullable = false)
    @JsonIgnore
    private FireDrill fireDrill;

    @Column(name = "issue_type", nullable = false)
    private String issueType;

    @Column(name = "severity", nullable = false)
    private String severity;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "remediation_notes", columnDefinition = "TEXT")
    private String remediationNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id")
    private Incident incident;

    public FireDrillIssue(FireDrill fireDrill, String issueType, String severity) {
        this.fireDrill = fireDrill;
        this.issueType = issueType;
        this.severity = severity;
    }

    // Helper methods
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

    public boolean isEscalated() {
        return incident != null;
    }

    public boolean hasRemediation() {
        return remediationNotes != null && !remediationNotes.trim().isEmpty();
    }

    public boolean isEquipmentIssue() {
        return "equipment".equals(issueType);
    }

    public boolean isProcedureIssue() {
        return "procedure".equals(issueType);
    }

    public boolean isSafetyIssue() {
        return "safety".equals(issueType);
    }

    public boolean isTimingIssue() {
        return "timing".equals(issueType);
    }

    public void escalateToIncident(Incident incident) {
        this.incident = incident;
    }
}
