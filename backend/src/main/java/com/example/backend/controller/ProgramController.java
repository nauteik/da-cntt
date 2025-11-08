package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.ProgramSelectDTO;
import com.example.backend.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for program management
 */
@RestController
@RequestMapping("/api/program")
@RequiredArgsConstructor
@Slf4j
public class ProgramController {

    private final ProgramService programService;

    /**
     * Get active programs for select dropdown
     * 
     * @return list of active programs
     * 
     * Example: GET /api/program/select
     */
    @GetMapping("/select")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<ProgramSelectDTO>>> getActiveProgramsForSelect() {
        log.info("GET /api/program/select - Fetching active programs for select");
        List<ProgramSelectDTO> programList = programService.getActiveProgramsForSelect();
        return ResponseEntity.ok(ApiResponse.success(programList, "Active programs retrieved successfully"));
    }
}

