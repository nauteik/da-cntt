package com.example.backend.model.entity;

import com.example.backend.model.enums.PayerType;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Payer entity for payment sources (Medicaid, private pay)
 */
@Entity
@Table(name = "payer", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"payer_name"}),
    @UniqueConstraint(columnNames = {"payer_identifier"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"claims"})
public class Payer extends BaseEntity {

    @Column(name = "payer_name", nullable = false)
    private String payerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private PayerType type = PayerType.MEDICAID;

    @Column(name = "payer_identifier", nullable = false)
    private String payerIdentifier;

    @Column(name = "submission_endpoint")
    private String submissionEndpoint;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> config = new HashMap<>();

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "payer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Claim> claims = new HashSet<>();

    public Payer(String payerName, PayerType type) {
        this.payerName = payerName;
        this.type = type;
    }

    // Helper methods
    public boolean isActivePayer() {
        return Boolean.TRUE.equals(isActive);
    }

    public boolean isMedicaid() {
        return PayerType.MEDICAID.equals(type);
    }

    public boolean isPrivatePay() {
        return PayerType.PRIVATE_PAY.equals(type);
    }
}

