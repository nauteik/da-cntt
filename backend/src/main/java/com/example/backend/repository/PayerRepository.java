package com.example.backend.repository;

import com.example.backend.model.entity.Payer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayerRepository extends JpaRepository<Payer, UUID> {
    Optional<Payer> findByPayerIdentifier(String payerIdentifier);
    
    List<Payer> findAllByIsActiveTrueOrderByPayerNameAsc();
}
