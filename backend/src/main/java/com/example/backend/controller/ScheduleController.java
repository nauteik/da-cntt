package com.example.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.PatientSelectDTO;
import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.schedule.AuthorizationSelectDTO;
import com.example.backend.model.dto.schedule.CreateScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.CreateSchedulePreviewRequestDTO;
import com.example.backend.model.dto.schedule.CreateSchedulePreviewResponseDTO;
import com.example.backend.model.dto.schedule.CreateScheduleBatchRequestDTO;
import com.example.backend.model.dto.schedule.GenerateScheduleRequest;
import com.example.backend.model.dto.schedule.InsertTemplateEventDTO;
import com.example.backend.model.dto.schedule.ScheduleEventDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateDTO;
import com.example.backend.model.dto.schedule.ScheduleTemplateWeeksDTO;
import com.example.backend.model.dto.schedule.TemplateEventDTO;
import com.example.backend.model.dto.schedule.UpdateScheduleEventDTO;
import com.example.backend.repository.AuthorizationRepository;
import com.example.backend.service.ScheduleService;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<ScheduleTemplateWeeksDTO>> getTemplate(
            @PathVariable UUID id) {
        ScheduleTemplateWeeksDTO template = scheduleService.getTemplateWithWeeks(id);
        if (template == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No active template found"));
        }
        return ResponseEntity.ok(ApiResponse.success(template, "Template with weeks fetched"));
    }

    @GetMapping("/authorizations/select")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
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
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<List<ScheduleEventDTO>>> getScheduleEvents(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String status) {
        List<ScheduleEventDTO> events = scheduleService.getScheduleEvents(id, from, to, status);
        return ResponseEntity.ok(ApiResponse.success(events, "Schedule events fetched"));
    }

    @GetMapping("/events/paginated")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<Page<ScheduleEventDTO>>> getScheduleEventsPaginated(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID staffId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "25") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Page<ScheduleEventDTO> events = scheduleService.getScheduleEvents(
                id, from, to, status, staffId, search, page, size, sortBy, sortDir
        );
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

    @GetMapping("/related-staff")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<List<StaffSelectDTO>>> getRelatedStaff(
            @PathVariable UUID id) {
        log.info("Fetching related staff for patient ID: {}", id);
        List<StaffSelectDTO> staffList = scheduleService.getRelatedStaffForPatient(id);
        return ResponseEntity.ok(ApiResponse.success(staffList, "Related staff fetched"));
    }
}

@RestController
@RequestMapping("/api/staff/{id}/schedule")
@RequiredArgsConstructor
@Slf4j
class StaffScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<Page<ScheduleEventDTO>>> getStaffScheduleEvents(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "25") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        log.info("Fetching schedule events for staff ID: {} from {} to {}", id, from, to);
        
        Page<ScheduleEventDTO> events = scheduleService.getScheduleEventsByStaff(
                id, from, to, status, patientId, search, page, size, sortBy, sortDir
        );
        return ResponseEntity.ok(ApiResponse.success(events, "Staff schedule events fetched"));
    }

    @GetMapping("/related-patients")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<List<PatientSelectDTO>>> getRelatedPatients(
            @PathVariable UUID id) {
        log.info("Fetching related patients for staff ID: {}", id);
        List<PatientSelectDTO> patientList = scheduleService.getRelatedPatientsForStaff(id);
        return ResponseEntity.ok(ApiResponse.success(patientList, "Related patients fetched"));
    }
}

/**
 * Global schedule controller for managing schedules across all patients and staff.
 * Handles schedule creation, preview, and listing with filtering.
 */
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@Slf4j
class GlobalScheduleController {

    private final ScheduleService scheduleService;

    /**
     * Get all schedule events with filtering and pagination.
     * Supports filters: date range, patient, staff, status, search
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','DSP')")
    public ResponseEntity<ApiResponse<Page<ScheduleEventDTO>>> getAllScheduleEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) UUID patientId,
            @RequestParam(required = false) UUID staffId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        log.info("Fetching all schedule events: from={}, to={}, patientId={}, staffId={}, status={}, page={}, size={}",
                from, to, patientId, staffId, status, page, size);

        Page<ScheduleEventDTO> events = scheduleService.getAllScheduleEvents(
                from, to, patientId, staffId, status, search, page, size, sortBy, sortDir
        );

        return ResponseEntity.ok(ApiResponse.success(events, "Schedule events fetched successfully"));
    }

    /**
     * Create a preview of schedule events with conflict detection.
     * Generates events based on repeat configuration and checks for conflicts.
     */
    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<CreateSchedulePreviewResponseDTO>> createSchedulePreview(
            @Valid @RequestBody CreateSchedulePreviewRequestDTO request,
            Authentication authentication
    ) {
        String authenticatedUserEmail = authentication.getName();
        log.info("Creating schedule preview for patient: {}", request.getScheduleEvent().getPatientId());

        CreateSchedulePreviewResponseDTO preview = scheduleService.createSchedulePreview(request, authenticatedUserEmail);

        return ResponseEntity.ok(ApiResponse.success(preview, "Preview created successfully"));
    }

    /**
     * Create schedule events after preview confirmation.
     * Should be called after conflicts are resolved in the preview.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<List<ScheduleEventDTO>>> createScheduleEvents(
            @Valid @RequestBody CreateScheduleBatchRequestDTO request,
            Authentication authentication
    ) {
        String authenticatedUserEmail = authentication.getName();
        log.info("Creating {} schedule events", request.getScheduleEvents().size());

        List<ScheduleEventDTO> createdEvents = scheduleService.createScheduleEvents(
                request.getScheduleEvents(),
                authenticatedUserEmail
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdEvents, "Schedule events created successfully"));
    }

    /**
     * Get a single schedule event by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleEventDTO>> getScheduleEvent(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String authenticatedUserEmail = authentication.getName();
        log.info("Fetching schedule event: {}", id);

        ScheduleEventDTO event = scheduleService.getScheduleEvent(id, authenticatedUserEmail);

        return ResponseEntity.ok(ApiResponse.success(event, "Schedule event fetched successfully"));
    }

    /**
     * Update a schedule event.
     * Only updates fields that are not null in the DTO (partial update).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<ScheduleEventDTO>> updateScheduleEvent(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateScheduleEventDTO dto,
            Authentication authentication
    ) {
        String authenticatedUserEmail = authentication.getName();
        log.info("Updating schedule event: {}", id);

        ScheduleEventDTO updatedEvent = scheduleService.updateScheduleEvent(id, dto, authenticatedUserEmail);

        return ResponseEntity.ok(ApiResponse.success(updatedEvent, "Schedule event updated successfully"));
    }
}


