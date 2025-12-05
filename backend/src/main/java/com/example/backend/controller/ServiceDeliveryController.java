package com.example.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ServiceDeliveryRequestDTO;
import com.example.backend.dto.ServiceDeliveryResponseDTO;
import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.VisitMaintenanceDTO;
import com.example.backend.model.enums.VisitStatus;
import com.example.backend.service.ServiceDeliveryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST API Controller for Service Delivery operations
 */
@Slf4j
@RestController
@RequestMapping("/api/service-delivery")
@RequiredArgsConstructor
public class ServiceDeliveryController {

    private final ServiceDeliveryService serviceDeliveryService;

    /**
     * Create a new service delivery
     * POST /api/service-delivery
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<ServiceDeliveryResponseDTO>> create(
            @Valid @RequestBody ServiceDeliveryRequestDTO dto) {
        log.info("Creating service delivery for schedule event: {}", dto.getScheduleEventId());
        ServiceDeliveryResponseDTO created = serviceDeliveryService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Service delivery created successfully"));
    }

    /**
     * Get service delivery by ID
     * GET /api/service-delivery/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<ServiceDeliveryResponseDTO>> getById(@PathVariable UUID id) {
        log.info("Getting service delivery: {}", id);
        ServiceDeliveryResponseDTO dto = serviceDeliveryService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Service delivery retrieved successfully"));
    }

    /**
     * Update service delivery
     * PUT /api/service-delivery/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceDeliveryResponseDTO>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ServiceDeliveryRequestDTO dto) {
        log.info("Updating service delivery: {}", id);
        ServiceDeliveryResponseDTO updated = serviceDeliveryService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Service delivery updated successfully"));
    }

    /**
     * Delete service delivery
     * DELETE /api/service-delivery/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        log.info("Deleting service delivery: {}", id);
        serviceDeliveryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Service delivery deleted successfully"));
    }

    /**
     * List all service deliveries with pagination
     * GET /api/service-delivery
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Page<ServiceDeliveryResponseDTO>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("Listing service deliveries - page: {}, size: {}", page, size);
        Page<ServiceDeliveryResponseDTO> result = serviceDeliveryService.list(page, size);
        return ResponseEntity.ok(ApiResponse.success(result, "Service deliveries retrieved successfully"));
    }

    /**
     * Get service deliveries by staff
     * GET /api/service-delivery/staff/{staffId}
     */
    @GetMapping("/staff/{staffId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<ServiceDeliveryResponseDTO>>> getByStaff(
            @PathVariable UUID staffId) {
        log.info("Getting service deliveries for staff: {}", staffId);
        List<ServiceDeliveryResponseDTO> result = serviceDeliveryService.getByStaff(staffId);
        return ResponseEntity.ok(ApiResponse.success(result, "Service deliveries retrieved successfully"));
    }

    /**
     * Get service deliveries by patient
     * GET /api/service-delivery/patient/{patientId}
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<ServiceDeliveryResponseDTO>>> getByPatient(
            @PathVariable UUID patientId) {
        log.info("Getting service deliveries for patient: {}", patientId);
        List<ServiceDeliveryResponseDTO> result = serviceDeliveryService.getByPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(result, "Service deliveries retrieved successfully"));
    }

    /**
     * Get service deliveries by office
     * GET /api/service-delivery/office/{officeId}
     */
    @GetMapping("/office/{officeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ServiceDeliveryResponseDTO>>> getByOffice(
            @PathVariable UUID officeId) {
        log.info("Getting service deliveries for office: {}", officeId);
        List<ServiceDeliveryResponseDTO> result = serviceDeliveryService.getByOffice(officeId);
        return ResponseEntity.ok(ApiResponse.success(result, "Service deliveries retrieved successfully"));
    }

    /**
     * Get service deliveries by date range
     * GET /api/service-delivery/date-range?startDate=2024-11-01&endDate=2024-11-30
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ServiceDeliveryResponseDTO>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        log.info("Getting service deliveries for date range: {} to {}", startDate, endDate);
        List<ServiceDeliveryResponseDTO> result = serviceDeliveryService.getByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(result, "Service deliveries retrieved successfully"));
    }

    /**
     * Get service deliveries by status
     * GET /api/service-delivery/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<List<ServiceDeliveryResponseDTO>>> getByStatus(
            @PathVariable String status) {
        log.info("Getting service deliveries with status: {}", status);
        List<ServiceDeliveryResponseDTO> result = serviceDeliveryService.getByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(result, "Service deliveries retrieved successfully"));
    }

    /**
     * Update service delivery status
     * PATCH /api/service-delivery/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceDeliveryResponseDTO>> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        log.info("Updating service delivery status: {} to {}", id, status);
        ServiceDeliveryResponseDTO updated = serviceDeliveryService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Status updated successfully"));
    }

    /**
     * Update service delivery approval status
     * PATCH /api/service-delivery/{id}/approval-status
     */
    @PatchMapping("/{id}/approval-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceDeliveryResponseDTO>> updateApprovalStatus(
            @PathVariable UUID id,
            @RequestParam String approvalStatus) {
        log.info("Updating service delivery approval status: {} to {}", id, approvalStatus);
        ServiceDeliveryResponseDTO updated = serviceDeliveryService.updateApprovalStatus(id, approvalStatus);
        return ResponseEntity.ok(ApiResponse.success(updated, "Approval status updated successfully"));
    }

    /**
     * Cancel service delivery
     * PATCH /api/service-delivery/{id}/cancel
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<ServiceDeliveryResponseDTO>> cancel(
            @PathVariable UUID id,
            @RequestParam String reason) {
        log.info("Cancelling service delivery: {} with reason: {}", id, reason);
        ServiceDeliveryResponseDTO cancelled = serviceDeliveryService.cancel(id, reason);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Service delivery cancelled successfully"));
    }

    /**
     * Get visit maintenance view with detailed information for billing verification
     * GET /api/service-delivery/visit-maintenance
     * 
     * This endpoint provides a specialized view of service deliveries formatted
     * for the Visit Maintenance screen, including calculated hours, units, and status.
     */
    @GetMapping("/visit-maintenance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<Page<VisitMaintenanceDTO>>> getVisitMaintenance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID clientId,
            @RequestParam(required = false) UUID employeeId,
            @RequestParam(required = false) UUID officeId,
            @RequestParam(required = false) VisitStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean cancelled,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(defaultValue = "startAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("GET /api/service-delivery/visit-maintenance - startDate: {}, endDate: {}, clientId: {}, employeeId: {}, status: {}, search: {}",
                startDate, endDate, clientId, employeeId, status, search);
        
        Page<VisitMaintenanceDTO> visits = serviceDeliveryService.getVisitMaintenance(
                startDate, endDate, clientId, employeeId, officeId, status, search, cancelled,
                page, size, sortBy, sortDir);
        
        log.info("Returning {} visits (page {}/{})", visits.getNumberOfElements(),
                visits.getNumber() + 1, visits.getTotalPages());
        
        return ResponseEntity.ok(ApiResponse.success(visits, "Visit maintenance data retrieved successfully"));
    }
}
