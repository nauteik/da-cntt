package com.example.backend.repository;

import com.example.backend.model.entity.ScheduleTemplateWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScheduleTemplateWeekRepository extends JpaRepository<ScheduleTemplateWeek, UUID> {

    List<ScheduleTemplateWeek> findAllByTemplate_IdOrderByWeekIndexAsc(UUID templateId);

    Optional<ScheduleTemplateWeek> findByTemplate_IdAndWeekIndex(UUID templateId, Integer weekIndex);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM ScheduleTemplateWeek w WHERE w.template.id = :templateId")
    void deleteAllByTemplateId(@Param("templateId") UUID templateId);
}


