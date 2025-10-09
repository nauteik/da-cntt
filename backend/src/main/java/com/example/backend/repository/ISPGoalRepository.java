package com.example.backend.repository;

import com.example.backend.model.entity.ISPGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ISPGoalRepository extends JpaRepository<ISPGoal, UUID> {
}
