package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.ServiceTypeSelectDTO;
import com.example.backend.service.ServiceTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for service type management
 */
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Slf4j
public class ServiceTypeController {

    private final ServiceTypeService serviceTypeService;

    /**
     * Get all service types for select dropdown
     * Returns id, code, and name for all service types.
     * 
     * @return list of service types
     * 
     * Example: GET /api/services/select
     * Response: [
     *   { "id": "uuid", "code": "SC", "code": "Service Coordination", "displayText": "SC - Service Coordination" },
     *   { "id": "uuid", "code": "RES", "name": "Respite", "displayText": "RES - Respite" }
     * ]
     */
    @GetMapping("/select")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<ServiceTypeSelectDTO>>> getServiceTypesForSelect() {
        log.info("GET /api/services/select - Fetching service types for select");
        List<ServiceTypeSelectDTO> serviceTypes = serviceTypeService.getServiceTypesForSelect();
        return ResponseEntity.ok(ApiResponse.success(serviceTypes, "Service types retrieved successfully"));
    }
}

