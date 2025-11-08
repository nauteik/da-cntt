package com.example.backend.controller;

import com.example.backend.dto.ServiceDeliveryCheckInCheckOutResponse;
import com.example.backend.dto.ServiceDeliveryCheckInRequest;
import com.example.backend.dto.ServiceDeliveryCheckOutRequest;
import com.example.backend.service.ServiceDeliveryCheckInCheckOutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API Controller for service delivery check-in/check-out operations with GPS validation
 */
@Slf4j
@RestController
@RequestMapping("/api/service-delivery/check-in-check-out")
@RequiredArgsConstructor
public class ServiceDeliveryCheckInCheckOutController {

    private final ServiceDeliveryCheckInCheckOutService checkInCheckOutService;

    /**
     * Check in to a service delivery with GPS location
     * POST /api/service-delivery/check-in-check-out/check-in
     */
    @PostMapping("/check-in")
    public ResponseEntity<ServiceDeliveryCheckInCheckOutResponse> checkIn(@Valid @RequestBody ServiceDeliveryCheckInRequest request) {
        log.info("Check-in request for service delivery: {}", request.getServiceDeliveryId());
        ServiceDeliveryCheckInCheckOutResponse response = checkInCheckOutService.checkIn(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Check out from a service delivery with GPS location
     * POST /api/service-delivery/check-in-check-out/check-out
     */
    @PostMapping("/check-out")
    public ResponseEntity<ServiceDeliveryCheckInCheckOutResponse> checkOut(@Valid @RequestBody ServiceDeliveryCheckOutRequest request) {
        log.info("Check-out request for service delivery: {}", request.getServiceDeliveryId());
        ServiceDeliveryCheckInCheckOutResponse response = checkInCheckOutService.checkOut(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get check-in/check-out info by service delivery ID
     * GET /api/service-delivery/check-in-check-out/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ServiceDeliveryCheckInCheckOutResponse> getById(@PathVariable UUID id) {
        log.info("Get check-in/check-out info for service delivery: {}", id);
        ServiceDeliveryCheckInCheckOutResponse response = checkInCheckOutService.getById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all check-in/check-out records for a staff member
     * GET /api/service-delivery/check-in-check-out/staff/{staffId}
     */
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<ServiceDeliveryCheckInCheckOutResponse>> getByStaff(@PathVariable UUID staffId) {
        log.info("Get check-in/check-out records for staff: {}", staffId);
        List<ServiceDeliveryCheckInCheckOutResponse> responses = checkInCheckOutService.getByStaff(staffId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get incomplete check-outs for a staff member (checked in but not checked out)
     * GET /api/service-delivery/check-in-check-out/staff/{staffId}/incomplete
     */
    @GetMapping("/staff/{staffId}/incomplete")
    public ResponseEntity<List<ServiceDeliveryCheckInCheckOutResponse>> getIncompleteByStaff(@PathVariable UUID staffId) {
        log.info("Get incomplete check-outs for staff: {}", staffId);
        List<ServiceDeliveryCheckInCheckOutResponse> responses = checkInCheckOutService.getIncompleteByStaff(staffId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all invalid check-in/check-out records (outside 1km radius)
     * GET /api/service-delivery/check-in-check-out/invalid
     */
    @GetMapping("/invalid")
    public ResponseEntity<List<ServiceDeliveryCheckInCheckOutResponse>> getInvalidCheckInCheckOuts() {
        log.info("Get all invalid check-in/check-out records");
        List<ServiceDeliveryCheckInCheckOutResponse> responses = checkInCheckOutService.getInvalidCheckInCheckOuts();
        return ResponseEntity.ok(responses);
    }
}
