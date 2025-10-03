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
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
     * Supports dynamic page sizes and sorting.
     * 
     * @param page page number (0-indexed)
     * @param size page size (default 20, max 100)
     * @param sortBy field to sort by (default: lastName)
     * @param sortDir sort direction (asc or desc, default: asc)
     * @return paginated patient summaries
     * 
     * Example: GET /api/patients?page=0&size=50&sortBy=lastName&sortDir=asc
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PatientSummaryDTO>>> getPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "firstName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        log.info("Fetching patients - page: {}, size: {}, sortBy: {}, sortDir: {}", 
            page, size, sortBy, sortDir);
        
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
        if ("clientName".equalsIgnoreCase(sortBy)) {
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            // Sort by first name, then last name for a natural full name sort
            sort = Sort.by(direction, "first_name", "last_name");
        } else {
            String dbColumnName = mapFieldToColumn(sortBy);
            sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(dbColumnName).descending() 
                : Sort.by(dbColumnName).ascending();
        }
        
        // Create pageable
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Fetch patients using optimized single query
        Page<PatientSummaryDTO> patients = patientService.getPatientSummaries(pageable);
        
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
            case "soc" -> "soc_date";
            case "eoc" -> "eoc_date";
            case "id" -> "id";
            default -> "last_name"; // default sort by last_name
        };
    }
}
