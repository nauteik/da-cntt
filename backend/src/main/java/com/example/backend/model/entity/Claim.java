package com.example.backend.model.entity;

import com.example.backend.model.enums.ClaimStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Claim entity for Medicaid billing
 */
@Entity
@Table(name = "claim", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"claim_number"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"office", "payor", "claimLines"})
public class Claim extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payor_id", nullable = false)
    private Payor payor;

    @Column(name = "claim_number", nullable = false)
    private String claimNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ClaimStatus status = ClaimStatus.DRAFT;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta = new HashMap<>();

    // Relationships
    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ClaimLine> claimLines = new HashSet<>();

    public Claim(Payor payor, String claimNumber) {
        this.payor = payor;
        this.claimNumber = claimNumber;
    }

    // Helper methods
    public boolean isDraft() {
        return ClaimStatus.DRAFT.equals(status);
    }

    public boolean isSubmitted() {
        return ClaimStatus.SUBMITTED.equals(status);
    }

    public boolean isPending() {
        return ClaimStatus.PENDING.equals(status);
    }

    public boolean isApproved() {
        return ClaimStatus.APPROVED.equals(status);
    }

    public boolean isDenied() {
        return ClaimStatus.DENIED.equals(status);
    }

    public boolean isPaid() {
        return ClaimStatus.PAID.equals(status);
    }

    public void submit() {
        this.status = ClaimStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
    }

    public BigDecimal calculateTotalAmount() {
        return claimLines.stream()
                .map(ClaimLine::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

