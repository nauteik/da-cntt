package com.example.backend.repository;

import com.example.backend.model.entity.Authorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthorizationRepository extends JpaRepository<Authorization, UUID> {
    List<Authorization> findAllByPatientIdOrderByStartDateDesc(UUID patientId);
    Boolean existsByPatientServiceId(UUID patientServiceId);
    List<Authorization> findAllByPatientPayerIdOrderByStartDateDesc(UUID patientPayerId);
    Optional<Authorization> findByAuthorizationNo(String authorizationNo);
}
