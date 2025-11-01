package com.example.backend.controller;

import com.example.backend.dto.DailyNoteCheckInCheckOutResponse;
import com.example.backend.dto.DailyNoteCheckInRequest;
import com.example.backend.dto.DailyNoteCheckOutRequest;
import com.example.backend.service.DailyNoteCheckInCheckOutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST API Controller for daily note check-in/check-out operations with GPS validation
 */
@Slf4j
@RestController
@RequestMapping("/api/daily-note/check-in-check-out")
@RequiredArgsConstructor
public class DailyNoteCheckInCheckOutController {

    private final DailyNoteCheckInCheckOutService checkInCheckOutService;

    /**
     * Check in to a daily note with GPS location
     * POST /api/daily-note/check-in-check-out/check-in
     */
    @PostMapping("/check-in")
    public ResponseEntity<DailyNoteCheckInCheckOutResponse> checkIn(@Valid @RequestBody DailyNoteCheckInRequest request) {
        log.info("Check-in request for daily note: {}", request.getDailyNoteId());
        DailyNoteCheckInCheckOutResponse response = checkInCheckOutService.checkIn(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Check out from a daily note with GPS location
     * POST /api/daily-note/check-in-check-out/check-out
     */
    @PostMapping("/check-out")
    public ResponseEntity<DailyNoteCheckInCheckOutResponse> checkOut(@Valid @RequestBody DailyNoteCheckOutRequest request) {
        log.info("Check-out request for daily note: {}", request.getDailyNoteId());
        DailyNoteCheckInCheckOutResponse response = checkInCheckOutService.checkOut(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get check-in/check-out info by daily note ID
     * GET /api/daily-note/check-in-check-out/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DailyNoteCheckInCheckOutResponse> getById(@PathVariable UUID id) {
        log.info("Get check-in/check-out info for daily note: {}", id);
        DailyNoteCheckInCheckOutResponse response = checkInCheckOutService.getById(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all check-in/check-out records for a staff member
     * GET /api/daily-note/check-in-check-out/staff/{staffId}
     */
    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<DailyNoteCheckInCheckOutResponse>> getByStaff(@PathVariable UUID staffId) {
        log.info("Get check-in/check-out records for staff: {}", staffId);
        List<DailyNoteCheckInCheckOutResponse> responses = checkInCheckOutService.getByStaff(staffId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get incomplete check-outs for a staff member (checked in but not checked out)
     * GET /api/daily-note/check-in-check-out/staff/{staffId}/incomplete
     */
    @GetMapping("/staff/{staffId}/incomplete")
    public ResponseEntity<List<DailyNoteCheckInCheckOutResponse>> getIncompleteByStaff(@PathVariable UUID staffId) {
        log.info("Get incomplete check-outs for staff: {}", staffId);
        List<DailyNoteCheckInCheckOutResponse> responses = checkInCheckOutService.getIncompleteByStaff(staffId);
        return ResponseEntity.ok(responses);
    }

    /**
     * Get all invalid check-in/check-out records (outside 1km radius)
     * GET /api/daily-note/check-in-check-out/invalid
     */
    @GetMapping("/invalid")
    public ResponseEntity<List<DailyNoteCheckInCheckOutResponse>> getInvalidCheckInCheckOuts() {
        log.info("Get all invalid check-in/check-out records");
        List<DailyNoteCheckInCheckOutResponse> responses = checkInCheckOutService.getInvalidCheckInCheckOuts();
        return ResponseEntity.ok(responses);
    }
}
