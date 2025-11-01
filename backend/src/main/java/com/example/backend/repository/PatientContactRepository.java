package com.example.backend.repository;

import com.example.backend.model.entity.PatientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface PatientContactRepository extends JpaRepository<PatientContact, UUID> {
    
    @Query("SELECT pc FROM PatientContact pc WHERE pc.patient.id = :patientId AND pc.isPrimary = true")
    List<PatientContact> findPrimaryContactsByPatientId(@Param("patientId") UUID patientId);
    
    @Query("SELECT pc FROM PatientContact pc WHERE pc.patient.id = :patientId ORDER BY pc.createdAt ASC")
    List<PatientContact> findAllByPatientIdOrderByCreatedAtAsc(@Param("patientId") UUID patientId);
    
    /**
     * Bulk insert patient contacts using native SQL for better performance
     */
    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO patient_contact (
            id, patient_id, name, relation, phone, email, line1, line2, is_primary, created_at, updated_at
        ) VALUES (
            :id, :patientId, :name, :relation, :phone, :email, :line1, :line2, :isPrimary, NOW(), NOW()
        )
        """, nativeQuery = true)
    void bulkInsertPatientContact(
        @Param("id") UUID id,
        @Param("patientId") UUID patientId,
        @Param("name") String name,
        @Param("relation") String relation,
        @Param("phone") String phone,
        @Param("email") String email,
        @Param("line1") String line1,
        @Param("line2") String line2,
        @Param("isPrimary") boolean isPrimary
    );
}
