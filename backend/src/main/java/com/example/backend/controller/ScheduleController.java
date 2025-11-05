package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.schedule.CreateScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.AuthorizationSelectDTO;
import com.example.backend.model.dto.schedule.ScheduleEventDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateWeeksDTO;
import com.example.backend.model.dto.schedule.TemplateEventDTO;
import com.example.backend.model.dto.schedule.InsertTemplateEventDTO;
import com.example.backend.model.dto.schedule.GenerateScheduleRequest;
import com.example.backend.service.ScheduleService;
import com.example.backend.repository.AuthorizationRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/patients/{id}/schedule")
@RequiredArgsConstructor
@Slf4j
public class ScheduleController {

    private final ScheduleService scheduleService;
    private final AuthorizationRepository authorizationRepository;

    @PostMapping("/template")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleTemplateDTO>> createTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody CreateScheduleTemplateDTO dto,
            Authentication authentication) {
        String authenticatedUserEmail = authentication.getName();
        log.info("Creating schedule template for patient ID: {}", id);
        ScheduleTemplateDTO template = scheduleService.createTemplate(id, dto, authenticatedUserEmail);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(template, "Schedule template created successfully"));
    }

    @PostMapping("/template/weeks")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleTemplateDTO>> addWeek(
            @PathVariable UUID id,
            @RequestParam Integer weekIndex,
            Authentication authentication) {
        log.info("Adding week {} to schedule template for patient ID: {}", weekIndex, id);
        ScheduleTemplateDTO template = scheduleService.addWeek(id, weekIndex);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(template, "Week added successfully"));
    }

    @DeleteMapping("/template/weeks/{weekIndex}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteWeek(
            @PathVariable UUID id,
            @PathVariable Integer weekIndex,
            Authentication authentication) {
        log.info("Deleting week {} from schedule template for patient ID: {}", weekIndex, id);
        scheduleService.deleteWeek(id, weekIndex);
        return ResponseEntity.ok(ApiResponse.success(null, "Week deleted successfully"));
    }

    @GetMapping("/template")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<ScheduleTemplateWeeksDTO>> getTemplate(
            @PathVariable UUID id) {
        ScheduleTemplateWeeksDTO template = scheduleService.getTemplateWithWeeks(id);
        if (template == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No active template found"));
        }
        return ResponseEntity.ok(ApiResponse.success(template, "Template with weeks fetched"));
    }

    @GetMapping("/authorizations/select")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<List<AuthorizationSelectDTO>>> getAuthorizationsForSelect(
            @PathVariable UUID id
    ) {
        var list = authorizationRepository.findAllByPatientIdOrderByStartDateDesc(id)
                .stream()
                .map(a -> new AuthorizationSelectDTO(
                        a.getId(),
                        a.getPatientService() != null && a.getPatientService().getServiceType() != null ? a.getPatientService().getServiceType().getCode() : null,
                        a.getPatientService() != null && a.getPatientService().getServiceType() != null ? a.getPatientService().getServiceType().getName() : null,
                        a.getEventCode(),
                        a.getFormat()
                ))
                .toList();
        return ResponseEntity.ok(ApiResponse.success(list, "Authorizations for select fetched"));
    }

    @DeleteMapping("/template")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(
            @PathVariable UUID id,
            Authentication authentication) {
        log.info("Deleting schedule template for patient ID: {}", id);
        scheduleService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Template deleted successfully"));
    }

    @PostMapping("/template/events")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<TemplateEventDTO>>> createTemplateEvent(
            @PathVariable UUID id,
            @Valid @RequestBody InsertTemplateEventDTO dto) {
        List<TemplateEventDTO> events = scheduleService.createTemplateEvent(id, dto);
        return ResponseEntity.ok(ApiResponse.success(events, "Template event created"));
    }

    // Update endpoint removed per requirement

    @DeleteMapping("/template/events/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<TemplateEventDTO>>> deleteTemplateEvent(
            @PathVariable UUID id,
            @PathVariable UUID eventId) {
        List<TemplateEventDTO> events = scheduleService.deleteTemplateEvent(id, eventId);
        return ResponseEntity.ok(ApiResponse.success(events, "Template event deleted"));
    }

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<ApiResponse<List<ScheduleEventDTO>>> getScheduleEvents(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String status) {
        List<ScheduleEventDTO> events = scheduleService.getScheduleEvents(id, from, to, status);
        return ResponseEntity.ok(ApiResponse.success(events, "Schedule events fetched"));
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Integer>> generateFromTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody GenerateScheduleRequest req
    ) {
        int created = scheduleService.generateFromTemplate(id, req.getEndDate());
        return ResponseEntity.ok(ApiResponse.success(created, "Schedule generated"));
    }
}


