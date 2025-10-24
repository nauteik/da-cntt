package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Staff entity for employee records
 */
@Entity
@Table(name = "staff", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"office_id", "employee_code"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"office", "user", "portraitFile", "documents", "certifications", "backgroundChecks"})
public class Staff extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    @JsonIgnore
    private Office office;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private AppUser user;

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name ="is_supervisor", nullable = false)
    private Boolean isSupervisor = false;

    @Column(name = "dob")
    private LocalDate dob;

    @Column(name = "gender")
    private String gender;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portrait_file_id")
    private FileObject portraitFile;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_fields", columnDefinition = "jsonb")
    private Map<String, Object> customFields = new HashMap<>();

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Relationships
    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<StaffDocument> documents = new HashSet<>();

    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<StaffCertification> certifications = new HashSet<>();

    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<BackgroundCheck> backgroundChecks = new HashSet<>();

    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<StaffAvailability> availability = new HashSet<>();

    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<StaffRate> rates = new HashSet<>();

    public Staff(Office office, String firstName, String lastName) {
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

    public void markAsDeleted() {
        this.deletedAt = LocalDateTime.now();
        this.isActive = false;
    }

    public boolean isActiveStaff() {
        return Boolean.TRUE.equals(isActive) && !isDeleted() && releaseDate == null;
    }

    public boolean isTerminated() {
        return releaseDate != null && releaseDate.isBefore(LocalDate.now());
    }
}

