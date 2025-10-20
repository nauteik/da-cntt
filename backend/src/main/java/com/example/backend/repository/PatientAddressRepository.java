package com.example.backend.repository;

import com.example.backend.model.entity.PatientAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientAddressRepository extends JpaRepository<PatientAddress, UUID> {
    
    @Query("SELECT pa FROM PatientAddress pa WHERE pa.patient.id = :patientId AND pa.isMain = true")
    List<PatientAddress> findMainAddressesByPatientId(@Param("patientId") UUID patientId);
    
    @Query("SELECT pa FROM PatientAddress pa WHERE pa.patient.id = :patientId ORDER BY pa.createdAt ASC")
    List<PatientAddress> findAllByPatientIdOrderByCreatedAtAsc(@Param("patientId") UUID patientId);
    
    /**
     * Bulk insert patient addresses using native SQL for better performance
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO patient_address (
            id, patient_id, address_id, phone, is_main, created_at, updated_at
        ) VALUES (
            :id, :patientId, :addressId, :phone, :isMain, NOW(), NOW()
        )
        """, nativeQuery = true)
    void bulkInsertPatientAddress(
        @Param("id") UUID id,
        @Param("patientId") UUID patientId,
        @Param("addressId") UUID addressId,
        @Param("phone") String phone,
        @Param("isMain") boolean isMain
    );
}
