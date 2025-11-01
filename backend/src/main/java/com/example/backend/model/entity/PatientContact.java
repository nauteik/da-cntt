package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Patient contact entity for guardian/emergency contact info
 */
@Entity
@Table(name = "patient_contact")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patient"})
public class PatientContact extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Column(name = "relation", nullable = false)
    private String relation;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "line1")
    private String line1;

    @Column(name = "line2")
    private String line2;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    public PatientContact(Patient patient, String relation, String name) {
        this.patient = patient;
        this.relation = relation;
        this.name = name;
    }

    // Helper methods
    public boolean isPrimaryContact() {
        return Boolean.TRUE.equals(isPrimary);
    }
}

