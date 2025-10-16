package com.example.backend.repository;

import com.example.backend.model.entity.PatientAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientAddressRepository extends JpaRepository<PatientAddress, UUID> {
    
    @Query("SELECT pa FROM PatientAddress pa WHERE pa.patient.id = :patientId AND pa.isMain = true")
    List<PatientAddress> findMainAddressesByPatientId(@Param("patientId") UUID patientId);
    
    @Query("SELECT pa FROM PatientAddress pa WHERE pa.patient.id = :patientId ORDER BY pa.createdAt ASC")
    List<PatientAddress> findAllByPatientIdOrderByCreatedAtAsc(@Param("patientId") UUID patientId);
}
