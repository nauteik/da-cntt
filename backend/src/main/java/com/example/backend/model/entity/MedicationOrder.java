package com.example.backend.model.entity;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.example.backend.model.enums.DrugForm;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Medication order entity for medication management
 */
@Entity
@Table(name = "medication_order")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patient", "prescriptionFile", "prnRules", "administrations"})
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicationOrder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Transient
    @JsonProperty("patientId")
    private UUID patientIdInput;

    @Column(name = "prescribing_provider")
    private String prescribingProvider;

    @Column(name = "pharmacy_info")
    private String pharmacyInfo;

    @Column(name = "drug_name", nullable = false)
    private String drugName;

    @Enumerated(EnumType.STRING)
    @Column(name = "drug_form")
    private DrugForm drugForm;

    @Column(name = "dosage", nullable = false)
    private String dosage;

    @Column(name = "route", nullable = false)
    private String route;

    @Column(name = "frequency", nullable = false)
    private String frequency;

    @Column(name = "indication")
    private String indication;

    @Column(name = "is_prn", nullable = false)
    @JsonProperty("isPrn")
    private Boolean isPrn = false;

    @Column(name = "is_controlled", nullable = false)
    @JsonProperty("isControlled")
    private Boolean isControlled = false;

    @Column(name = "start_at", nullable = false)
    @JsonProperty("startAt")
    private LocalDate startAt;

    @Column(name = "end_at")
    @JsonProperty("endAt")
    private LocalDate endAt;

    @Column(name = "status", nullable = false)
    private String status = "active";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_file_id")
    private FileObject prescriptionFile;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "interaction_flags", columnDefinition = "jsonb")
    private Map<String, Object> interactionFlags = new HashMap<>();

    // === Inventory Management ===
    @Column(name = "current_stock")
    private Double currentStock = 0.0;

    @Column(name = "reorder_level")
    private Double reorderLevel = 0.0;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure; // e.g., "tablets", "ml", "patches"

    // Relationships
    @OneToMany(mappedBy = "medicationOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PRNRule> prnRules = new HashSet<>();

    @OneToMany(mappedBy = "medicationOrder", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MedicationAdministration> administrations = new HashSet<>();

    public MedicationOrder(Patient patient, String drugName, 
                          String dosage, String route, String frequency, LocalDate startAt) {
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

    public boolean isControlled() {
        return Boolean.TRUE.equals(isControlled);
    }

    public boolean isExpired() {
        return endAt != null && endAt.isBefore(LocalDate.now());
    }

    public boolean isEffectiveOn(LocalDate date) {
        return !startAt.isAfter(date) && (endAt == null || endAt.isAfter(date));
    }

    public void deductStock(Double amount) {
        if (this.currentStock != null) {
            this.currentStock -= amount;
        }
    }

    public boolean isLowStock() {
        return currentStock != null && reorderLevel != null && currentStock <= reorderLevel;
    }
}

