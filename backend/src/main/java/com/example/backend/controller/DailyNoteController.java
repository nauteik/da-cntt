package com.example.backend.controller;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.DailyNoteRequestDTO;
import com.example.backend.model.dto.DailyNoteResponseDTO;
import com.example.backend.service.DailyNoteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/daily-notes")
@RequiredArgsConstructor
@Slf4j
public class DailyNoteController {

    private final DailyNoteService dailyNoteService;

    @PostMapping
    public ResponseEntity<ApiResponse<DailyNoteResponseDTO>> create(@Valid @RequestBody DailyNoteRequestDTO dto) {
        DailyNoteResponseDTO created = dailyNoteService.create(dto);
        return ResponseEntity.ok(ApiResponse.success(created, "Daily note created"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DailyNoteResponseDTO>> getById(@PathVariable UUID id) {
        DailyNoteResponseDTO dto = dailyNoteService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(dto, "Daily note retrieved"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DailyNoteResponseDTO>> update(@PathVariable UUID id, @Valid @RequestBody DailyNoteRequestDTO dto) {
        DailyNoteResponseDTO updated = dailyNoteService.update(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated, "Daily note updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        dailyNoteService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Daily note deleted"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DailyNoteResponseDTO>>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<DailyNoteResponseDTO> p = dailyNoteService.list(page, size);
        return ResponseEntity.ok(ApiResponse.success(p, "Daily notes retrieved"));
    }
}
