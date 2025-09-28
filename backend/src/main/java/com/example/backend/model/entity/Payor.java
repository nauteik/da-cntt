package com.example.backend.model.entity;

import com.example.backend.model.enums.PayorType;
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
 * Payor entity for payment sources (Medicaid, private pay)
 */
@Entity
@Table(name = "payor", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"serviceAuthorizations", "claims"})
public class Payor extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private PayorType type = PayorType.MEDICAID;

    @Column(name = "payer_identifier")
    private String payerIdentifier;

    @Column(name = "submission_endpoint")
    private String submissionEndpoint;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "config", columnDefinition = "jsonb")
    private Map<String, Object> config = new HashMap<>();

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Relationships
    @OneToMany(mappedBy = "payor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ServiceAuthorization> serviceAuthorizations = new HashSet<>();

    @OneToMany(mappedBy = "payor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Claim> claims = new HashSet<>();

    public Payor(String name, PayorType type) {
        this.name = name;
        this.type = type;
    }

    // Helper methods
    public boolean isActivePayor() {
        return Boolean.TRUE.equals(isActive);
    }

    public boolean isMedicaid() {
        return PayorType.MEDICAID.equals(type);
    }

    public boolean isPrivatePay() {
        return PayorType.PRIVATE_PAY.equals(type);
    }
}

