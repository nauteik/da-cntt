package com.example.backend.repository;

import com.example.backend.model.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository for Staff entity
 */
@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {
}
