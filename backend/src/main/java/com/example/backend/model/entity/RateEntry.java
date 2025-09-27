package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Rate entry entity for rate card entries
 */
@Entity
@Table(name = "rate_entry", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"rate_card_id", "service_type_id", "staff_id", "patient_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"rateCard", "serviceType", "staff", "patient"})
public class RateEntry extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rate_card_id", nullable = false)
    @JsonIgnore
    private RateCard rateCard;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(name = "rate", precision = 10, scale = 2, nullable = false)
    private BigDecimal rate;

    @Column(name = "pay_basis", nullable = false)
    private String payBasis = "per_unit";

    public RateEntry(RateCard rateCard, BigDecimal rate, String payBasis) {
        this.rateCard = rateCard;
        this.rate = rate;
        this.payBasis = payBasis;
    }

    // Helper methods
    public boolean isPerUnit() {
        return "per_unit".equals(payBasis);
    }

    public boolean isPerHour() {
        return "per_hour".equals(payBasis);
    }

    public boolean isFlat() {
        return "flat".equals(payBasis);
    }
}

