package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

/**
 * Remittance allocation entity for allocating payments to claim lines
 */
@Entity
@Table(name = "remittance_allocation")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"remittance", "claimLine"})
public class RemittanceAllocation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "remittance_id", nullable = false)
    @JsonIgnore
    private Remittance remittance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_line_id")
    private ClaimLine claimLine;

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "adjustment_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal adjustmentAmount = BigDecimal.ZERO;

    @Column(name = "adjustment_code")
    private String adjustmentCode;

    public RemittanceAllocation(Remittance remittance, ClaimLine claimLine, BigDecimal paidAmount) {
        this.remittance = remittance;
        this.claimLine = claimLine;
        this.paidAmount = paidAmount;
    }

    // Helper methods
    public BigDecimal getNetAmount() {
        return paidAmount.subtract(adjustmentAmount);
    }

    public boolean hasAdjustment() {
        return adjustmentAmount.compareTo(BigDecimal.ZERO) != 0;
    }

    public boolean isPositiveAdjustment() {
        return adjustmentAmount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isNegativeAdjustment() {
        return adjustmentAmount.compareTo(BigDecimal.ZERO) < 0;
    }
}
