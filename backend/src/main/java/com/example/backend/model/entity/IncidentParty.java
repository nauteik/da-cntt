package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Incident party entity for tracking who was involved in incident
 */
@Entity
@Table(name = "incident_party")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"incident", "staff", "patient"})
public class IncidentParty extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id", nullable = false)
    @JsonIgnore
    private Incident incident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "role", nullable = false)
    private String role;

    public IncidentParty(Incident incident, String role) {
        this.incident = incident;
        this.role = role;
    }

    public IncidentParty(Incident incident, Staff staff, String role) {
        this.incident = incident;
        this.staff = staff;
        this.role = role;
    }

    public IncidentParty(Incident incident, Patient patient, String role) {
        this.incident = incident;
        this.patient = patient;
        this.role = role;
    }

    // Helper methods
    public boolean isVictim() {
        return "victim".equals(role);
    }

    public boolean isWitness() {
        return "witness".equals(role);
    }

    public boolean isInvolved() {
        return "involved".equals(role);
    }

    public boolean isReporter() {
        return "reporter".equals(role);
    }

    public boolean isStaffMember() {
        return staff != null;
    }

    public boolean isPatient() {
        return patient != null;
    }

    public String getPartyName() {
        if (staff != null) {
            return staff.getFullName();
        } else if (patient != null) {
            return patient.getFullName();
        }
        return "Unknown";
    }
}
