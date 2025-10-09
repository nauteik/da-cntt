package com.example.backend.repository;

import com.example.backend.model.entity.ISP;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ISPRepository extends JpaRepository<ISP, UUID> {
}
