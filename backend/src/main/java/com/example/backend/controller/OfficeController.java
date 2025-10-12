package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.OfficeDTO;
import com.example.backend.service.OfficeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for office management
 */
@RestController
@RequestMapping("/api/office")
@RequiredArgsConstructor
@Slf4j
public class OfficeController {

    private final OfficeService officeService;

    /**
     * Get active offices only
     * 
     * @return list of active offices
     * 
     * Example: GET /api/offices/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<ApiResponse<List<OfficeDTO>>> getActiveOffices() {
        List<OfficeDTO> offices = officeService.getActiveOffices();
        return ResponseEntity.ok(ApiResponse.success(offices));
    }

}
