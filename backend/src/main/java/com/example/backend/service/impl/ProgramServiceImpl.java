package com.example.backend.service.impl;

import com.example.backend.model.dto.ProgramSelectDTO;
import com.example.backend.model.entity.Program;
import com.example.backend.repository.ProgramRepository;
import com.example.backend.service.ProgramService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ProgramService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProgramServiceImpl implements ProgramService {

    private final ProgramRepository programRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProgramSelectDTO> getActiveProgramsForSelect() {
        log.info("Fetching active programs for select dropdown");
        List<Program> activePrograms = programRepository.findByIsActiveTrue();
        
        return activePrograms.stream()
                .sorted(Comparator.comparing(Program::getProgramIdentifier))
                .map(this::mapToSelectDTO)
                .collect(Collectors.toList());
    }

    /**
     * Map Program entity to ProgramSelectDTO
     */
    private ProgramSelectDTO mapToSelectDTO(Program program) {
        return ProgramSelectDTO.builder()
                .id(program.getId())
                .programIdentifier(program.getProgramIdentifier())
                .build();
    }
}

