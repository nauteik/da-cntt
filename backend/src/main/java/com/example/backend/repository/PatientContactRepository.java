package com.example.backend.repository;

import com.example.backend.model.entity.PatientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientContactRepository extends JpaRepository<PatientContact, UUID> {
    
    @Query("SELECT pc FROM PatientContact pc WHERE pc.patient.id = :patientId AND pc.isPrimary = true")
    List<PatientContact> findPrimaryContactsByPatientId(@Param("patientId") UUID patientId);
    
    @Query("SELECT pc FROM PatientContact pc WHERE pc.patient.id = :patientId ORDER BY pc.createdAt ASC")
    List<PatientContact> findAllByPatientIdOrderByCreatedAtAsc(@Param("patientId") UUID patientId);
}
