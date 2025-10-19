package com.example.backend.repository;

import com.example.backend.model.entity.PatientProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientProgramRepository extends JpaRepository<PatientProgram, UUID> {
    Optional<PatientProgram> findByPatientId(UUID patientId);
}
