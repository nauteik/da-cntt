package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.backend.model.entity.StaffAddress;
import java.util.UUID;

/**
 * Repository interface for managing StaffAddress entities
 * Extends JpaRepository for basic CRUD operations and custom queries
 */
public interface StaffAddressRepository extends JpaRepository<StaffAddress, UUID> {
    
}
