package com.example.backend.repository;

import com.example.backend.model.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface ProgramRepository extends JpaRepository<Program, UUID> {
    boolean existsByProgramIdentifier(String programIdentifier);
    Optional<Program> findByProgramIdentifier(String programIdentifier);
    List<Program> findByIsActiveTrue();
}
