package com.example.backend.service.impl;
import com.example.backend.model.dto.OfficeDTO;
import com.example.backend.model.entity.Office;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.service.OfficeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of OfficeService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OfficeServiceImpl implements OfficeService {

    private final OfficeRepository officeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OfficeDTO> getActiveOffices() {
        log.info("Fetching active offices");
        List<Office> offices = officeRepository.findAll();
        return offices.stream()
                .filter(office -> office.getIsActive() && !office.isDeleted())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Map Office entity to OfficeDTO
     */
    private OfficeDTO mapToDTO(Office office) {
        return OfficeDTO.builder()
                .id(office.getId())
                .code(office.getCode())
                .name(office.getName())
                .county(office.getCounty())
                .phone(office.getPhone())
                .email(office.getEmail())
                .timezone(office.getTimezone())
                .isActive(office.getIsActive())
                .build();
    }
}
