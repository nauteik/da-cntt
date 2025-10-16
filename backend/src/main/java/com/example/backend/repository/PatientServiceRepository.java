package com.example.backend.repository;

import com.example.backend.model.entity.PatientService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for PatientService entity
 */
@Repository
public interface PatientServiceRepository extends JpaRepository<PatientService, UUID> {
    
    /**
     * Find all patient services for a list of patient IDs
     * 
     * @param patientIds list of patient UUIDs
     * @return list of patient services
     */
    List<PatientService> findByPatientIdIn(List<UUID> patientIds);

    List<PatientService> findAllByPatientIdOrderByStartDateDesc(UUID patientId);
}
