package com.example.backend.service;

import com.example.backend.model.dto.schedule.CreateScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.ScheduleEventDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateWeeksDTO;
import com.example.backend.model.dto.schedule.TemplateEventDTO;
import com.example.backend.model.dto.schedule.InsertTemplateEventDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ScheduleService {

    ScheduleTemplateWeeksDTO getTemplateWithWeeks(UUID patientId);

    ScheduleTemplateDTO createTemplate(UUID patientId, CreateScheduleTemplateDTO dto, String authenticatedUserEmail);

    ScheduleTemplateDTO addWeek(UUID patientId, Integer weekIndex);

    void deleteWeek(UUID patientId, Integer weekIndex);

    void deleteTemplate(UUID patientId);

    List<TemplateEventDTO> createTemplateEvent(UUID patientId, InsertTemplateEventDTO dto);

    List<TemplateEventDTO> deleteTemplateEvent(UUID patientId, UUID eventId);

    List<ScheduleEventDTO> getScheduleEvents(UUID patientId, LocalDate from, LocalDate to, String status);
}


