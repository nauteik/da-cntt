package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

/**
 * Residence stay entity for tracking patient residence history
 */
@Entity
@Table(name = "residence_stay")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patient", "organization", "address", "leaseFile"})
public class ResidenceStay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @Column(name = "residence_type", nullable = false)
    private String residenceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @Column(name = "move_in_at", nullable = false)
    private LocalDate moveInAt;

    @Column(name = "move_out_at")
    private LocalDate moveOutAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lease_file_id")
    private FileObject leaseFile;

    @Column(name = "note")
    private String note;

    public ResidenceStay(Patient patient, Organization organization, String residenceType, LocalDate moveInAt) {
        this.patient = patient;
        this.organization = organization;
        this.residenceType = residenceType;
        this.moveInAt = moveInAt;
    }

    // Helper methods
    public boolean isCurrent() {
        return moveOutAt == null || moveOutAt.isAfter(LocalDate.now());
    }

    public boolean isGroupHome() {
        return "group_home".equalsIgnoreCase(residenceType);
    }

    public boolean isLifeSharing() {
        return "life_sharing".equalsIgnoreCase(residenceType);
    }

    public boolean isSupportedLiving() {
        return "supported_living".equalsIgnoreCase(residenceType);
    }

    public long getStayDurationDays() {
        LocalDate endDate = moveOutAt != null ? moveOutAt : LocalDate.now();
        return moveInAt.until(endDate).getDays();
    }
}

