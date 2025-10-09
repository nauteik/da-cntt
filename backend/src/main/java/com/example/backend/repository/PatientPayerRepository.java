package com.example.backend.repository;

import com.example.backend.model.entity.PatientPayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PatientPayerRepository extends JpaRepository<PatientPayer, UUID> {
}
