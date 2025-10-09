package com.example.backend.repository;

import com.example.backend.model.entity.PatientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PatientContactRepository extends JpaRepository<PatientContact, UUID> {
}
