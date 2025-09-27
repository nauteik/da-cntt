package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Claim line entity for individual claim line items
 */
@Entity
@Table(name = "claim_line")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"claim", "serviceDelivery", "patient", "staff", "serviceType", "remittanceAllocations"})
public class ClaimLine extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    @JsonIgnore
    private Claim claim;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_delivery_id")
    private ServiceDelivery serviceDelivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @Column(name = "service_date", nullable = false)
    private LocalDate serviceDate;

    @Column(name = "units", nullable = false)
    private Integer units;

    @Column(name = "rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal rate;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "status", nullable = false)
    private String status = "pending";

    @Column(name = "denial_reason")
    private String denialReason;

    // Relationships
    @OneToMany(mappedBy = "claimLine", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<RemittanceAllocation> remittanceAllocations = new HashSet<>();

    public ClaimLine(Claim claim, Patient patient, LocalDate serviceDate, Integer units, BigDecimal rate, BigDecimal amount) {
        this.claim = claim;
        this.patient = patient;
        this.serviceDate = serviceDate;
        this.units = units;
        this.rate = rate;
        this.amount = amount;
    }

    // Helper methods
    public boolean isPending() {
        return "pending".equals(status);
    }

    public boolean isApproved() {
        return "approved".equals(status);
    }

    public boolean isDenied() {
        return "denied".equals(status);
    }

    public boolean isPaid() {
        return "paid".equals(status);
    }

    public BigDecimal getTotalPaidAmount() {
        return remittanceAllocations.stream()
                .map(RemittanceAllocation::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getOutstandingAmount() {
        return amount.subtract(getTotalPaidAmount());
    }

    public boolean isFullyPaid() {
        return getTotalPaidAmount().compareTo(amount) >= 0;
    }
}
