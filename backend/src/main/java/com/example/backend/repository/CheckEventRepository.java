package com.example.backend.repository;

import com.example.backend.model.entity.CheckEvent;
import com.example.backend.model.enums.CheckEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CheckEventRepository extends JpaRepository<CheckEvent, UUID> {

    Optional<CheckEvent> findFirstByScheduleEvent_IdAndEventTypeOrderByOccurredAtAsc(UUID scheduleEventId, CheckEventType eventType);

    Optional<CheckEvent> findFirstByScheduleEvent_IdAndEventTypeOrderByOccurredAtDesc(UUID scheduleEventId, CheckEventType eventType);

    // ==================== Dashboard Queries ====================
    
    /**
     * Get recent check-in/check-out events for dashboard activities
     */
    @org.springframework.data.jpa.repository.Query("SELECT ce FROM CheckEvent ce WHERE ce.occurredAt >= :fromDateTime ORDER BY ce.occurredAt DESC")
    org.springframework.data.domain.Page<CheckEvent> findRecentCheckEvents(
        @org.springframework.data.repository.query.Param("fromDateTime") java.time.LocalDateTime fromDateTime, 
        org.springframework.data.domain.Pageable pageable
    );
}


