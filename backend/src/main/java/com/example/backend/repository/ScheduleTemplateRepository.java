package com.example.backend.repository;

import com.example.backend.model.entity.ScheduleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduleTemplateRepository extends JpaRepository<ScheduleTemplate, UUID> {

    List<ScheduleTemplate> findAllByPatient_IdOrderByCreatedAtDesc(UUID patientId);

    Optional<ScheduleTemplate> findFirstByPatient_IdAndStatusOrderByCreatedAtDesc(UUID patientId, String status);
}


