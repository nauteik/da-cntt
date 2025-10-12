package com.example.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.entity.DailyNote;

@Repository
public interface DailyNoteRepository extends JpaRepository<DailyNote, UUID> {
    List<DailyNote> findByPatientId(UUID patientId);
    List<DailyNote> findByStaffId(UUID staffId);
    List<DailyNote> findByServiceDeliveryId(UUID serviceDeliveryId);
}
