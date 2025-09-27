package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Patient provider entity for linking doctors/specialists
 */
@Entity
@Table(name = "patient_provider")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patient"})
public class PatientProvider extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Column(name = "role", nullable = false)
    private String role;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "npi")
    private String npi; // National Provider Identifier

    public PatientProvider(Patient patient, String role, String name) {
        this.patient = patient;
        this.role = role;
        this.name = name;
    }

    // Helper methods
    public boolean isPrimaryProvider() {
        return "primary".equalsIgnoreCase(role) || "pcp".equalsIgnoreCase(role);
    }

    public boolean isSpecialist() {
        return "specialist".equalsIgnoreCase(role);
    }

    public boolean hasNPI() {
        return npi != null && !npi.trim().isEmpty();
    }
}

