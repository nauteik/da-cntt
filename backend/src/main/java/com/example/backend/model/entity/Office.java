package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Office entity representing each office/county
 */
@Entity
@Table(name = "office", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "code"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "address", "staff", "patients"})
public class Office extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "county")
    private String county;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "timezone", nullable = false)
    private String timezone = "America/New_York";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "billing_config", columnDefinition = "jsonb")
    private Map<String, Object> billingConfig = new HashMap<>();

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Relationships
    @OneToMany(mappedBy = "office", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Staff> staff = new HashSet<>();

    @OneToMany(mappedBy = "office", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Patient> patients = new HashSet<>();

    public Office(Organization organization, String code, String name) {
        this.organization = organization;
        this.code = code;
        this.name = name;
    }

    // Helper methods
    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void markAsDeleted() {
        this.deletedAt = LocalDateTime.now();
    }

    public void addStaff(Staff staff) {
        this.staff.add(staff);
        staff.setOffice(this);
    }

    public void removeStaff(Staff staff) {
        this.staff.remove(staff);
        staff.setOffice(null);
    }
}

