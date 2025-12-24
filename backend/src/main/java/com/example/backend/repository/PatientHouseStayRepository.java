package com.example.backend.repository;

import com.example.backend.model.entity.PatientHouseStay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientHouseStayRepository extends JpaRepository<PatientHouseStay, UUID> {

    /**
     * Find current active stay for a patient (move_out_date IS NULL)
     */
    Optional<PatientHouseStay> findByPatientIdAndMoveOutDateIsNull(UUID patientId);

    /**
     * Find current patient staying in a house (move_out_date IS NULL)
     */
    Optional<PatientHouseStay> findByHouseIdAndMoveOutDateIsNull(UUID houseId);

    /**
     * Get all stays for a patient ordered by move_in_date descending (most recent first)
     */
    List<PatientHouseStay> findByPatientIdOrderByMoveInDateDesc(UUID patientId);

    /**
     * Check if patient has an active stay
     */
    boolean existsByPatientIdAndMoveOutDateIsNull(UUID patientId);

    /**
     * Check if house has an active patient
     */
    boolean existsByHouseIdAndMoveOutDateIsNull(UUID houseId);

    /**
     * Get all stays for a house ordered by move_in_date descending
     */
    List<PatientHouseStay> findByHouseIdOrderByMoveInDateDesc(UUID houseId);
}

