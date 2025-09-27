package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Fire drill participant entity for tracking who participated/supervised
 */
@Entity
@Table(name = "fire_drill_participant")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"fireDrill", "staff", "patient"})
public class FireDrillParticipant extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fire_drill_id", nullable = false)
    @JsonIgnore
    private FireDrill fireDrill;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "acknowledged", nullable = false)
    private Boolean acknowledged = false;

    public FireDrillParticipant(FireDrill fireDrill, String role) {
        this.fireDrill = fireDrill;
        this.role = role;
    }

    public FireDrillParticipant(FireDrill fireDrill, Staff staff, String role) {
        this.fireDrill = fireDrill;
        this.staff = staff;
        this.role = role;
    }

    public FireDrillParticipant(FireDrill fireDrill, Patient patient, String role) {
        this.fireDrill = fireDrill;
        this.patient = patient;
        this.role = role;
    }

    // Helper methods
    public boolean isAcknowledged() {
        return Boolean.TRUE.equals(acknowledged);
    }

    public boolean isParticipant() {
        return "participant".equals(role);
    }

    public boolean isSupervisor() {
        return "supervisor".equals(role);
    }

    public boolean isObserver() {
        return "observer".equals(role);
    }

    public boolean isStaffMember() {
        return staff != null;
    }

    public boolean isPatient() {
        return patient != null;
    }

    public void acknowledge() {
        this.acknowledged = true;
    }

    public String getParticipantName() {
        if (staff != null) {
            return staff.getFullName();
        } else if (patient != null) {
            return patient.getFullName();
        }
        return "Unknown";
    }
}
