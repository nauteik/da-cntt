package com.example.backend.model.entity;

import com.example.backend.model.enums.AddressType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

/**
 * Address entity for storing standardized addresses
 */
@Entity
@Table(name = "address")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString
public class Address extends BaseEntity {

    @Column(name = "line1", nullable = false)
    private String line1;

    @Column(name = "line2")
    private String line2;

    @Column(name = "label")
    private String label;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "state", nullable = false)
    private String state;

    @Column(name = "postal_code", nullable = false)
    private String postalCode;

    @Column(name = "county", nullable = false)
    private String county = "USA";

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private AddressType type;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta = new HashMap<>();

    @OneToMany(mappedBy = "address", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PatientAddress> patientAddresses = new HashSet<>();

    public Address(String line1, String city, String state, String postalCode) {
        this.line1 = line1;
        this.city = city;
        this.state = state;
        this.postalCode = postalCode;
    }

    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        sb.append(line1);
        if (line2 != null && !line2.trim().isEmpty()) {
            sb.append(", ").append(line2);
        }
        sb.append(", ").append(city)
          .append(", ").append(state)
          .append(" ").append(postalCode);
        return sb.toString();
    }

    public boolean hasCoordinates() {
        return latitude != null && longitude != null;
    }
}

