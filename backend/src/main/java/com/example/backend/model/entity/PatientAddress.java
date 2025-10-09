package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "patient_address", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "address_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@ToString(exclude = {"patient", "address"})
public class PatientAddress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;

    public PatientAddress(Patient patient, Address address, String phone) {
        this.patient = patient;
        this.address = address;
        this.phone = phone;
    }
}
