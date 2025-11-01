package com.example.backend.service;

import java.util.UUID;

import org.springframework.data.domain.Page;

import com.example.backend.model.dto.DailyNoteRequestDTO;
import com.example.backend.model.dto.DailyNoteResponseDTO;

public interface DailyNoteService {
    DailyNoteResponseDTO create(DailyNoteRequestDTO dto);
    DailyNoteResponseDTO getById(UUID id);
    DailyNoteResponseDTO update(UUID id, DailyNoteRequestDTO dto);
    void delete(UUID id);
    Page<DailyNoteResponseDTO> list(int page, int size);
}
