package com.example.backend.repository;

import com.example.backend.model.entity.ScheduleTemplateEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScheduleTemplateEventRepository extends JpaRepository<ScheduleTemplateEvent, UUID> {

    List<ScheduleTemplateEvent> findAllByTemplateWeek_IdOrderByDayOfWeekAscStartTimeAsc(UUID templateWeekId);

    List<ScheduleTemplateEvent> findAllByTemplateWeek_Template_IdAndTemplateWeek_WeekIndexOrderByDayOfWeekAscStartTimeAsc(
            UUID templateId,
            Integer weekIndex
    );

    List<ScheduleTemplateEvent> findAllByTemplateWeek_Template_Patient_IdAndDayOfWeekOrderByStartTimeAsc(
            UUID patientId,
            Short dayOfWeek
    );

    List<ScheduleTemplateEvent> findAllByTemplateWeek_Template_Id(UUID templateId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ScheduleTemplateEvent e WHERE e.templateWeek.template.id = :templateId")
    void deleteAllByTemplateId(@Param("templateId") UUID templateId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ScheduleTemplateEvent e WHERE e.templateWeek.id = :weekId")
    void deleteAllByWeekId(@Param("weekId") UUID weekId);

    // Find overlapping events in the same week and day
    @Query("""
        SELECT e FROM ScheduleTemplateEvent e
        WHERE e.templateWeek.id = :weekId
        AND e.dayOfWeek = :dayOfWeek
        AND (
            (e.startTime < :endTime AND e.endTime > :startTime)
            OR (e.startTime = :startTime AND e.endTime = :endTime)
        )
        """)
    List<ScheduleTemplateEvent> findOverlappingEvents(
        @Param("weekId") UUID weekId,
        @Param("dayOfWeek") Short dayOfWeek,
        @Param("startTime") java.time.LocalTime startTime,
        @Param("endTime") java.time.LocalTime endTime
    );

    // Find overlapping events in the same week and day, excluding the current event
    @Query("""
        SELECT e FROM ScheduleTemplateEvent e
        WHERE e.templateWeek.id = :weekId
        AND e.dayOfWeek = :dayOfWeek
        AND e.id != :eventId
        AND (
            (e.startTime < :endTime AND e.endTime > :startTime)
            OR (e.startTime = :startTime AND e.endTime = :endTime)
        )
        """)
    List<ScheduleTemplateEvent> findOverlappingEventsExcludingCurrent(
        @Param("weekId") UUID weekId,
        @Param("dayOfWeek") Short dayOfWeek,
        @Param("startTime") java.time.LocalTime startTime,
        @Param("endTime") java.time.LocalTime endTime,
        @Param("eventId") UUID eventId
    );
}


