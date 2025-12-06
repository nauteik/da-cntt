package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.AuthorizationDetailDTO;
import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.AuthorizationSearchRequestDTO;
import com.example.backend.model.dto.UpdateAuthorizationDTO;
import com.example.backend.service.AuthorizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * REST Controller for authorization management
 */
@RestController
@RequestMapping("/api/authorizations")
@RequiredArgsConstructor
@Slf4j
public class AuthorizationController {

    private final AuthorizationService authorizationService;

    /**
     * Search authorizations with various filters, pagination, and sorting
     * 
     * @param startDate filter by start date (optional)
     * @param endDate filter by end date (optional)
     * @param payerId filter by payer ID (optional)
     * @param supervisorId filter by supervisor ID (optional)
     * @param programId filter by program ID (optional)
     * @param serviceTypeId filter by service type ID (optional)
     * @param authorizationNo filter by authorization number (optional, partial match)
     * @param clientId filter by client ID (optional, partial match)
     * @param clientFirstName filter by client first name (optional, partial match)
     * @param clientLastName filter by client last name (optional, partial match)
     * @param status filter by status: ACTIVE, EXPIRED, PENDING (optional)
     * @param include filter by include type: "Active Authorizations", "All" (optional)
     * @param page page number (0-indexed, default: 0)
     * @param size page size (default: 25)
     * @param sortBy field to sort by (optional)
     * @param sortDir sort direction: asc or desc (default: asc)
     * @return paginated list of authorization search results
     * 
     * Example: GET /api/authorizations/search?startDate=2024-01-01&endDate=2024-12-31&page=0&size=25&sortBy=startDate&sortDir=desc
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<Page<AuthorizationSearchDTO>>> searchAuthorizations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID payerId,
            @RequestParam(required = false) UUID supervisorId,
            @RequestParam(required = false) UUID programId,
            @RequestParam(required = false) UUID serviceTypeId,
            @RequestParam(required = false) String authorizationNo,
            @RequestParam(required = false) String clientId,
            @RequestParam(required = false) String clientFirstName,
            @RequestParam(required = false) String clientLastName,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        log.info("GET /api/authorizations/search - page={}, size={}, sortBy={}, sortDir={}", page, size, sortBy, sortDir);

        // Build search request DTO
        AuthorizationSearchRequestDTO request = new AuthorizationSearchRequestDTO();
        request.setStartDate(startDate);
        request.setEndDate(endDate);
        request.setPayerId(payerId);
        request.setSupervisorId(supervisorId);
        request.setProgramId(programId);
        request.setServiceTypeId(serviceTypeId);
        request.setAuthorizationNo(authorizationNo);
        request.setClientId(clientId);
        request.setClientFirstName(clientFirstName);
        request.setClientLastName(clientLastName);
        request.setStatus(status);

        // Build pageable with sorting
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isEmpty()) {
            Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, sortBy);
        }
        Pageable pageable = PageRequest.of(page, size, sort);

        // Search authorizations
        Page<AuthorizationSearchDTO> result = authorizationService.searchAuthorizations(request, pageable);

        return ResponseEntity.ok(
            ApiResponse.success(result, "Authorizations retrieved successfully")
        );
    }

    /**
     * Get authorization details by ID
     * 
     * @param id authorization UUID
     * @return authorization detail information
     * 
     * Example: GET /api/authorizations/123e4567-e89b-12d3-a456-426614174000
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<AuthorizationDetailDTO>> getAuthorizationById(
            @PathVariable UUID id) {
        
        log.info("GET /api/authorizations/{}", id);
        
        AuthorizationDetailDTO detail = authorizationService.getAuthorizationById(id);
        
        return ResponseEntity.ok(
            ApiResponse.success(detail, "Authorization retrieved successfully")
        );
    }

    /**
     * Update authorization
     * 
     * @param id authorization UUID
     * @param updateDTO update DTO with fields to update
     * @return updated authorization detail information
     * 
     * Example: PATCH /api/authorizations/123e4567-e89b-12d3-a456-426614174000
     * Body: {
     *   "authorizationNo": "AUTH-123",
     *   "format": "units",
     *   "maxUnits": 1000.00,
     *   "startDate": "2024-01-01",
     *   "endDate": "2024-12-31",
     *   "comments": "Updated comments"
     * }
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<AuthorizationDetailDTO>> updateAuthorization(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAuthorizationDTO updateDTO) {
        
        log.info("PATCH /api/authorizations/{}", id);
        
        AuthorizationDetailDTO updated = authorizationService.updateAuthorization(id, updateDTO);
        
        return ResponseEntity.ok(
            ApiResponse.success(updated, "Authorization updated successfully")
        );
    }
}

