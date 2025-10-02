package com.example.backend.model.entity;

import com.example.backend.model.enums.PatientStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Patient entity for patient records
 */
@Entity
@Table(name = "patient", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"medicaid_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"office", "supervisor", "patientAddresses", "contacts","residenceStays", "isps"})
public class Patient extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    @JsonIgnore
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private Staff supervisor;

    @Column(name = "medicaid_id")
    private String medicaidId; // Medical Record Number

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "gender")
    private String gender;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PatientAddress> patientAddresses = new HashSet<>();

    @Column(name = "primary_language")
    private String primaryLanguage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "medical_profile", columnDefinition = "jsonb")
    private Map<String, Object> medicalProfile = new HashMap<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PatientStatus status;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Relationships
    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PatientContact> contacts = new HashSet<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ResidenceStay> residenceStays = new HashSet<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ISP> isps = new HashSet<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MedicationOrder> medicationOrders = new HashSet<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PatientService> serviceMappings = new HashSet<>();

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<PatientPayer> patientPayers = new HashSet<>();

    public Patient(Office office, String firstName, String lastName) {
        this.office = office;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Helper methods
    public String getFullName() {
        return firstName + " " + lastName;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public int getAge() {
        if (dob == null) return 0;
        return LocalDate.now().getYear() - dob.getYear();
    }

    public PatientContact getPrimaryContact() {
        return contacts.stream()
                .filter(contact -> Boolean.TRUE.equals(contact.getIsPrimary()))
                .findFirst()
                .orElse(null);
    }
}

