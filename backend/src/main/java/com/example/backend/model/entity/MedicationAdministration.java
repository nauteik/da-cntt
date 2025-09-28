package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Medication administration entity for eMAR tracking
 */
@Entity
@Table(name = "medication_administration")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"medicationOrder", "patient", "staff", "serviceDelivery"})
public class MedicationAdministration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_order_id", nullable = false)
    @JsonIgnore
    private MedicationOrder medicationOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_delivery_id")
    private ServiceDelivery serviceDelivery;

    @Column(name = "administered_at", nullable = false)
    private LocalDateTime administeredAt;

    @Column(name = "dose_given")
    private String doseGiven;

    @Column(name = "status", nullable = false)
    private String status = "given";

    @Column(name = "is_prn", nullable = false)
    private Boolean isPrn = false;

    @Column(name = "prn_reason")
    private String prnReason;

    @Column(name = "prn_follow_up")
    private String prnFollowUp;

    public MedicationAdministration(MedicationOrder medicationOrder, 
                                   Patient patient, Staff staff, LocalDateTime administeredAt) {
        this.medicationOrder = medicationOrder;
        this.patient = patient;
        this.staff = staff;
        this.administeredAt = administeredAt;
    }

    // Helper methods
    public boolean isPRN() {
        return Boolean.TRUE.equals(isPrn);
    }

    public boolean wasGiven() {
        return "given".equals(status);
    }

    public boolean wasRefused() {
        return "refused".equals(status);
    }

    public boolean wasHeld() {
        return "held".equals(status);
    }
}

