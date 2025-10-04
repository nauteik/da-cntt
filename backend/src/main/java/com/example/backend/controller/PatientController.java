package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for patient management
 */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
@Slf4j
public class PatientController {

    private final PatientService patientService;

    /**
     * Get paginated list of patient summaries.
     * Supports dynamic page sizes, sorting, searching, and status filtering.
     * 
     * @param page page number (0-indexed)
     * @param size page size (default 20, max 100)
     * @param sortBy field to sort by (default: firstName)
     * @param sortDir sort direction (asc or desc, default: asc)
     * @param search optional search text to filter by client name, medicaid ID, or client payer ID
     * @param status optional list of patient statuses to filter by (ACTIVE, INACTIVE, PENDING)
     * @return paginated patient summaries
     * 
     * Example: GET /api/patients?page=0&size=50&sortBy=lastName&sortDir=asc&search=john&status=ACTIVE&status=PENDING
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientSummaryDTO>>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) List<String> status) {
        
        log.info("Fetching patients - page: {}, size: {}, sortBy: {}, sortDir: {}, search: '{}', status: {}", 
            page, size, sortBy, sortDir, search, status);
        
        // Validate page size to prevent performance issues
        if (size > 100) {
            size = 100;
        }
        if (size < 1) {
            size = 20;
        }
        
        // Validate page number
        if (page < 0) {
            page = 0;
        }
        
        // Map camelCase field names to snake_case database column names and create Sort object
        Sort sort;
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;

        if ("clientName".equalsIgnoreCase(sortBy)) {
            // Sort by first name, then last name for a natural full name sort
            sort = Sort.by(direction, "first_name", "last_name");
        } else {
            String dbColumnName = mapFieldToColumn(sortBy);
            // For columns from joined tables, we must use JpaSort.unsafe()
            // to prevent Spring from prepending the root entity alias.
            if (dbColumnName.contains(".")) {
                sort = JpaSort.unsafe(direction, dbColumnName);
            } else {
                sort = Sort.by(direction, dbColumnName);
            }
        }
        
        // Create pageable
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Fetch patients using optimized single query with optional filters
        Page<PatientSummaryDTO> patients = patientService.getPatientSummaries(search, status, pageable);
        
        log.info("Retrieved {} patients out of {} total (page {}/{})", 
            patients.getNumberOfElements(), 
            patients.getTotalElements(),
            patients.getNumber() + 1,
            patients.getTotalPages());
        
        return ResponseEntity.ok(
            ApiResponse.success(patients, "Patients retrieved successfully")
        );
    }
    
    /**
     * Map camelCase field names to snake_case database column names.
     * This is necessary because the native query uses actual database column names.
     * 
     * @param fieldName the field name from the API request (camelCase)
     * @return the corresponding database column name (snake_case)
     */
    private String mapFieldToColumn(String fieldName) {
        return switch (fieldName.toLowerCase()) {
            case "firstname", "clientname" -> "first_name";
            case "lastname" -> "last_name";
            case "medicaidid" -> "medicaid_id";
            case "status" -> "status";
            case "asof" -> "as_of";
            case "soc" -> "pp_latest.soc_date";
            case "eoc" -> "pp_latest.eoc_date";
            case "id" -> "id";
            default -> "last_name"; // default sort by last_name
        };
    }
}
