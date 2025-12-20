package com.example.backend.model.entity;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Patient allergy entity for tracking allergies and contraindications
 */
@Entity
@Table(name = "patient_allergy")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patient"})
public class PatientAllergy extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Transient
    @JsonProperty("patientId")
    private UUID patientIdInput;

    @Column(name = "allergen", nullable = false)
    private String allergen; // Drug name, food, or environmental factor

    @Column(name = "reaction")
    private String reaction; // e.g., "Rash", "Anaphylaxis"

    @Column(name = "severity")
    private String severity; // Mild, Moderate, Severe

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "notes")
    private String notes;

    public PatientAllergy(Patient patient, String allergen, String severity) {
        this.patient = patient;
        this.allergen = allergen;
        this.severity = severity;
    }
}
