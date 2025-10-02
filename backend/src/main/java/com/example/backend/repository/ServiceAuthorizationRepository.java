package com.example.backend.repository;

import com.example.backend.model.entity.ServiceAuthorization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ServiceAuthorizationRepository extends JpaRepository<ServiceAuthorization, UUID> {
}
