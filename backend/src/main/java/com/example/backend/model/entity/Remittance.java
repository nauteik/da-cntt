package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
 * Remittance entity for payment reconciliation
 */
@Entity
@Table(name = "remittance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "remit_number"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "payor", "file", "allocations"})
public class Remittance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payor_id")
    private Payor payor;

    @Column(name = "remit_number", nullable = false)
    private String remitNumber;

    @Column(name = "received_at", nullable = false)
    private LocalDateTime receivedAt;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileObject file;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta = new HashMap<>();

    // Relationships
    @OneToMany(mappedBy = "remittance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<RemittanceAllocation> allocations = new HashSet<>();

    public Remittance(Organization organization, String remitNumber, LocalDateTime receivedAt, BigDecimal totalAmount) {
        this.organization = organization;
        this.remitNumber = remitNumber;
        this.receivedAt = receivedAt;
        this.totalAmount = totalAmount;
    }

    // Helper methods
    public BigDecimal getAllocatedAmount() {
        return allocations.stream()
                .map(RemittanceAllocation::getPaidAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal getUnallocatedAmount() {
        return totalAmount.subtract(getAllocatedAmount());
    }

    public boolean isFullyAllocated() {
        return getUnallocatedAmount().compareTo(BigDecimal.ZERO) <= 0;
    }

    public int getAllocationCount() {
        return allocations.size();
    }
}
