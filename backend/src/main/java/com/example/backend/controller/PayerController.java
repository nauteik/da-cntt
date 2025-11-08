package com.example.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.PayerSelectDTO;
import com.example.backend.service.PayerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for payer management
 */
@RestController
@RequestMapping("/api/payer")
@RequiredArgsConstructor
@Slf4j
public class PayerController {

    private final PayerService payerService;

    /**
     * Get all active payers for select dropdown
     * Returns id, payerIdentifier, and payerName for all active payers.
     * 
     * @return list of active payers
     * 
     * Example: GET /api/payer/select
     * Response: [
     *   { "id": "uuid", "payerIdentifier": "PAODP", "payerName": "PA ODP" },
     *   { "id": "uuid", "payerIdentifier": "MEDICAID", "payerName": "Medicaid" }
     * ]
     */
    @GetMapping("/select")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'DSP')")
    public ResponseEntity<ApiResponse<List<PayerSelectDTO>>> getPayersForSelect() {
        log.info("GET /api/payer/select - Fetching active payers for select");
        List<PayerSelectDTO> payers = payerService.getPayersForSelect();
        return ResponseEntity.ok(ApiResponse.success(payers, "Active payers retrieved successfully"));
    }
}

