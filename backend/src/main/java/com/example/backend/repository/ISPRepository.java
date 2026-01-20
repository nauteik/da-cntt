package com.example.backend.repository;

import com.example.backend.model.entity.ISP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ISPRepository extends JpaRepository<ISP, UUID> {
    
    /**
     * Find the latest ISP for a patient (ordered by version number descending)
     */
    Optional<ISP> findFirstByPatientIdOrderByVersionNoDesc(UUID patientId);
    
    /**
     * Find all ISPs for a patient
     */
    List<ISP> findByPatientIdOrderByVersionNoDesc(UUID patientId);
    
    /**
     * Check if a version number already exists for a patient
     */
    boolean existsByPatientIdAndVersionNo(UUID patientId, Integer versionNo);
}
