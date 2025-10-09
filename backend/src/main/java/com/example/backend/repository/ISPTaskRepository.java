package com.example.backend.repository;

import com.example.backend.model.entity.ISPTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ISPTaskRepository extends JpaRepository<ISPTask, UUID> {
}
