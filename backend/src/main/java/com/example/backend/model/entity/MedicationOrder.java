package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Medication order entity for medication management
 */
@Entity
@Table(name = "medication_order")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "patient", "prescriptionFile", "prnRules", "administrations"})
public class MedicationOrder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Column(name = "prescribing_provider")
    private String prescribingProvider;

    @Column(name = "drug_name", nullable = false)
    private String drugName;

    @Column(name = "dosage", nullable = false)
    private String dosage;

    @Column(name = "route", nullable = false)
    private String route;

    @Column(name = "frequency", nullable = false)
    private String frequency;

    @Column(name = "indication")
    private String indication;

    @Column(name = "is_prn", nullable = false)
    private Boolean isPrn = false;

    @Column(name = "start_at", nullable = false)
    private LocalDate startAt;

    @Column(name = "end_at")
    private LocalDate endAt;

    @Column(name = "status", nullable = false)
    private String status = "active";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_file_id")
    private FileObject prescriptionFile;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "interaction_flags", columnDefinition = "jsonb")
    private Map<String, Object> interactionFlags = new HashMap<>();

    // Relationships
    @OneToMany(mappedBy = "medicationOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PRNRule> prnRules = new HashSet<>();

    @OneToMany(mappedBy = "medicationOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MedicationAdministration> administrations = new HashSet<>();

    public MedicationOrder(Organization organization, Patient patient, String drugName, 
                          String dosage, String route, String frequency, LocalDate startAt) {
        this.organization = organization;
        this.patient = patient;
        this.drugName = drugName;
        this.dosage = dosage;
        this.route = route;
        this.frequency = frequency;
        this.startAt = startAt;
    }

    // Helper methods
    public boolean isActive() {
        return "active".equals(status);
    }

    public boolean isPRN() {
        return Boolean.TRUE.equals(isPrn);
    }

    public boolean isExpired() {
        return endAt != null && endAt.isBefore(LocalDate.now());
    }

    public boolean isEffectiveOn(LocalDate date) {
        return !startAt.isAfter(date) && (endAt == null || endAt.isAfter(date));
    }
}

