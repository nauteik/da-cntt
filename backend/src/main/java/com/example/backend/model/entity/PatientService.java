package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Maps patients to the services they are eligible for or assigned to.
 */
@Entity
@Table(name = "patient_service", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "service_type_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@ToString(exclude = {"patient", "serviceType"})
public class PatientService extends BaseEntity { 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @Column(name = "start_date")
    private java.time.LocalDate startDate;

    @Column(name = "end_date")
    private java.time.LocalDate endDate;

    public PatientService(Patient patient, ServiceType serviceType) {
        this.patient = patient;
        this.serviceType = serviceType;
    }
}
