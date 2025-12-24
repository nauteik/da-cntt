package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

/**
 * Patient house stay entity for tracking patient residence history
 */
@Entity
@Table(name = "patient_house_stay")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patient", "house"})
public class PatientHouseStay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "house_id", nullable = false)
    @JsonIgnore
    private House house;

    @NotNull
    @Column(name = "move_in_date", nullable = false)
    private LocalDate moveInDate;

    @Column(name = "move_out_date")
    private LocalDate moveOutDate;

    public PatientHouseStay(Patient patient, House house, LocalDate moveInDate) {
        this.patient = patient;
        this.house = house;
        this.moveInDate = moveInDate;
    }

    // Helper methods
    public boolean isActive() {
        return moveOutDate == null;
    }

    public void unassign(LocalDate moveOutDate) {
        if (moveOutDate != null && moveOutDate.isBefore(moveInDate)) {
            throw new IllegalArgumentException("Move out date cannot be before move in date");
        }
        this.moveOutDate = moveOutDate;
    }
}




