package com.example.backend.repository;

import com.example.backend.model.entity.ScheduleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleEventRepository extends JpaRepository<ScheduleEvent, UUID> {

    List<ScheduleEvent> findAllByPatient_IdAndEventDateBetweenOrderByEventDateAscStartAtAsc(
            UUID patientId,
            LocalDate from,
            LocalDate to
    );

    List<ScheduleEvent> findAllByPatient_IdAndStaff_IdAndEventDateBetweenOrderByEventDateAscStartAtAsc(
            UUID patientId,
            UUID staffId,
            LocalDate from,
            LocalDate to
    );
}


