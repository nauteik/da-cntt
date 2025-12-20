package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.MedicationAdministration;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, UUID> {
    List<MedicationAdministration> findByPatientIdAndAdministeredAtBetween(UUID patientId, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT m FROM MedicationAdministration m WHERE m.isError = true OR m.adverseEventNotes IS NOT NULL")
    List<MedicationAdministration> findIncidents();

    @Query("SELECT m FROM MedicationAdministration m WHERE m.medicationOrder.id = :orderId ORDER BY m.administeredAt DESC")
    List<MedicationAdministration> findLatestByOrderId(UUID orderId);
}
