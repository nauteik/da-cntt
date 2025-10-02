package com.example.backend.repository;

import com.example.backend.model.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, UUID> {
    Optional<ServiceType> findByCode(String code);
    boolean existsByCode(String code);
}