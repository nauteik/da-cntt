package com.example.backend.service;

import com.example.backend.model.dto.schedule.CreateScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.ScheduleEventDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateWeeksDTO;
import com.example.backend.model.dto.schedule.TemplateEventDTO;
import com.example.backend.model.dto.schedule.InsertTemplateEventDTO;
import com.example.backend.model.dto.schedule.CreateSchedulePreviewRequestDTO;
import com.example.backend.model.dto.schedule.CreateSchedulePreviewResponseDTO;
import com.example.backend.model.dto.schedule.CreateScheduleEventDTO;
import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.PatientSelectDTO;

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

    TemplateEventDTO updateTemplateEvent(UUID patientId, UUID eventId, com.example.backend.model.dto.schedule.UpdateTemplateEventDTO dto);

    List<TemplateEventDTO> deleteTemplateEvent(UUID patientId, UUID eventId);

    List<ScheduleEventDTO> getScheduleEvents(UUID patientId, LocalDate from, LocalDate to, String status);

    org.springframework.data.domain.Page<ScheduleEventDTO> getScheduleEvents(
            UUID patientId,
            LocalDate from,
            LocalDate to,
            String status,
            UUID staffId,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    org.springframework.data.domain.Page<ScheduleEventDTO> getScheduleEventsByStaff(
            UUID staffId,
            LocalDate from,
            LocalDate to,
            String status,
            UUID patientId,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    int generateFromTemplate(UUID patientId, LocalDate endDate);

    List<StaffSelectDTO> getRelatedStaffForPatient(UUID patientId);

    List<PatientSelectDTO> getRelatedPatientsForStaff(UUID staffId);

    // New methods for global schedule management
    
    /**
     * Get all schedule events across all patients with filtering and pagination.
     */
    org.springframework.data.domain.Page<ScheduleEventDTO> getAllScheduleEvents(
            LocalDate from,
            LocalDate to,
            UUID patientId,
            UUID staffId,
            String status,
            String search,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    /**
     * Create a preview of schedule events with conflict detection.
     * Generates events based on repeat configuration if provided.
     */
    CreateSchedulePreviewResponseDTO createSchedulePreview(
            CreateSchedulePreviewRequestDTO request,
            String authenticatedUserEmail
    );

    /**
     * Create schedule events after preview confirmation.
     * Validates that events don't have unresolved conflicts.
     */
    List<ScheduleEventDTO> createScheduleEvents(
            List<CreateScheduleEventDTO> events,
            String authenticatedUserEmail
    );

    /**
     * Get a single schedule event by ID.
     */
    ScheduleEventDTO getScheduleEvent(UUID eventId, String authenticatedUserEmail);

    /**
     * Update a schedule event.
     * Only updates fields that are not null in the DTO (partial update).
     */
    ScheduleEventDTO updateScheduleEvent(
            UUID eventId,
            com.example.backend.model.dto.schedule.UpdateScheduleEventDTO dto,
            String authenticatedUserEmail
    );
}


