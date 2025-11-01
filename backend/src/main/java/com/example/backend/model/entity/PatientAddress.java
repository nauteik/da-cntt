package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
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

    @Column(name = "email")
    private String email;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "location_notes")
    private String locationNotes; // Ghi chú về vị trí (ví dụ: tầng, căn hộ, etc.)

    public PatientAddress(Patient patient, Address address, String phone, String email) {
        this.patient = patient;
        this.address = address;
        this.phone = phone;
        this.email = email;
    }

    public PatientAddress(Patient patient, Address address, String phone, String email, 
                         Double latitude, Double longitude) {
        this.patient = patient;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
