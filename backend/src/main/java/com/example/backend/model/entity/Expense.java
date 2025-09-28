package com.example.backend.model.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * Expense entity for tracking related costs for financial reconciliation
 */
@Entity
@Table(name = "expense")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"office", "patient"})
public class Expense extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    @Column(name = "category", nullable = false)
    private String category;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "incurred_at", nullable = false)
    private LocalDate incurredAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta = new HashMap<>();

    public Expense(String category, BigDecimal amount, LocalDate incurredAt) {
        this.category = category;
        this.amount = amount;
        this.incurredAt = incurredAt;
    }

    // Helper methods
    public boolean isPatientSpecific() {
        return patient != null;
    }

    public boolean isOfficeSpecific() {
        return office != null;
    }

    public boolean isCurrentMonth() {
        LocalDate now = LocalDate.now();
        return incurredAt.getYear() == now.getYear() && incurredAt.getMonth() == now.getMonth();
    }

    public boolean isCurrentYear() {
        return incurredAt.getYear() == LocalDate.now().getYear();
    }
}
