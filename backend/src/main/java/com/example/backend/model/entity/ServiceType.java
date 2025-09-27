package com.example.backend.model.entity;

import com.example.backend.model.enums.CareSetting;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * Service type entity for mapping ISP, schedule and billing
 */
@Entity
@Table(name = "service_type", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "code"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "staffRates", "rateEntries"})
public class ServiceType extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "care_setting", nullable = false)
    private CareSetting careSetting = CareSetting.NON_RESIDENTIAL;

    @Column(name = "description")
    private String description;

    @Column(name = "unit_basis", nullable = false)
    private String unitBasis = "15min";

    @Column(name = "is_billable", nullable = false)
    private Boolean isBillable = true;

    // Relationships
    @OneToMany(mappedBy = "serviceType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<StaffRate> staffRates = new HashSet<>();

    @OneToMany(mappedBy = "serviceType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<RateEntry> rateEntries = new HashSet<>();

    public ServiceType(Organization organization, String code, String name, CareSetting careSetting) {
        this.organization = organization;
        this.code = code;
        this.name = name;
        this.careSetting = careSetting;
    }

    // Helper methods
    public boolean isBillableService() {
        return Boolean.TRUE.equals(isBillable);
    }

    public boolean isResidential() {
        return CareSetting.RESIDENTIAL.equals(careSetting);
    }

    public boolean isNonResidential() {
        return CareSetting.NON_RESIDENTIAL.equals(careSetting);
    }
}

