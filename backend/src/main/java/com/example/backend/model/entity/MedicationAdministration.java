package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Medication administration entity for eMAR tracking
 */
@Entity
@Table(name = "medication_administration")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"medicationOrder", "patient", "staff", "witnessStaff", "serviceDelivery"})
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MedicationAdministration extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_order_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"administrations", "patient", "hibernateLazyInitializer", "handler"})
    private MedicationOrder medicationOrder;

    @Transient
    @JsonProperty("medicationOrderId")
    private UUID medicationOrderIdInput;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Transient
    @JsonProperty("patientId")
    private UUID patientIdInput;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    @JsonIgnore
    private Staff staff;

    @Transient
    @JsonProperty("staffId")
    private UUID staffIdInput;

    /**
     * Second staff member for double-signing (required for controlled medications)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "witness_staff_id")
    @JsonIgnore
    private Staff witnessStaff;

    @Transient
    @JsonProperty("witnessStaffId")
    private UUID witnessStaffIdInput;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_delivery_id")
    private ServiceDelivery serviceDelivery;

    @Column(name = "administered_at", nullable = false)
    private LocalDateTime administeredAt;

    @Column(name = "dose_given")
    private String doseGiven;

    @Column(name = "status", nullable = false)
    private String status = "given"; // given, refused, held, missed

    @Column(name = "is_prn", nullable = false)
    @JsonProperty("isPrn")
    private Boolean isPrn = false;

    @Column(name = "prn_reason")
    private String prnReason;

    @Column(name = "prn_follow_up")
    private String prnFollowUp;

    // === Vitals (Required for special medications) ===
    @Column(name = "systolic_bp")
    private Integer systolicBP;

    @Column(name = "diastolic_bp")
    private Integer diastolicBP;

    @Column(name = "pulse")
    private Integer pulse;

    @Column(name = "glucose")
    private Double glucose;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "respiration_rate")
    private Integer respirationRate;

    @Column(name = "oxygen_saturation")
    private Double oxygenSaturation;

    // === Incidents & Compliance ===
    @Column(name = "is_error", nullable = false)
    private Boolean isError = false;

    @Column(name = "error_description")
    private String errorDescription;

    @Column(name = "adverse_event_notes")
    private String adverseEventNotes;

    @Column(name = "notes")
    private String notes;

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

    public boolean isError() {
        return Boolean.TRUE.equals(isError);
    }
}

