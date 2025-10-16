package com.example.backend.model.entity;

import com.example.backend.model.enums.CareSetting;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * Service type entity for mapping patient services, schedule and billing
 */
@Entity
@Table(name = "service_type", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"code"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"staffRates", "rateEntries"})
public class ServiceType extends BaseEntity {

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

    @OneToMany(mappedBy = "serviceType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PatientService> patientMappings = new HashSet<>();

    public ServiceType(String code, String name, CareSetting careSetting) {
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

