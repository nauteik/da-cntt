package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.RoleDTO;
import com.example.backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for role management
 */
@RestController
@RequestMapping("/api/role")
@RequiredArgsConstructor
@Slf4j
public class RoleController {

    private final RoleService roleService;

    /**
     * Get active roles for select dropdown
     * 
     * @return list of active roles
     * 
     * Example: GET /api/role/active
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<RoleDTO>>> getActiveRoles() {
        log.info("GET /api/role/active - Fetching active roles for select");
        List<RoleDTO> roles = roleService.getActiveRoles();
        return ResponseEntity.ok(ApiResponse.success(roles, "Active roles retrieved successfully"));
    }
}
