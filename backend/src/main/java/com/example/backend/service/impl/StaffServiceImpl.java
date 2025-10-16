package com.example.backend.service.impl;

import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.entity.Staff;
import com.example.backend.repository.StaffRepository;
import com.example.backend.service.StaffService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of StaffService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;

    @Override
    @Transactional(readOnly = true)
    public List<StaffSelectDTO> getActiveStaffForSelect() {
        log.info("Fetching active staff for select dropdown");
        List<Staff> activeStaff = staffRepository.findByIsActiveTrueAndDeletedAtIsNull();
        
        return activeStaff.stream()
                .sorted(Comparator.comparing(Staff::getLastName)
                        .thenComparing(Staff::getFirstName))
                .map(this::mapToSelectDTO)
                .collect(Collectors.toList());
    }

    /**
     * Map Staff entity to StaffSelectDTO
     * Format: "FirstName LastName (EmployeeCode) - OfficeName"
     */
    private StaffSelectDTO mapToSelectDTO(Staff staff) {
        String displayName = String.format("%s %s (%s) - %s",
                staff.getFirstName(),
                staff.getLastName(),
                staff.getEmployeeCode() != null ? staff.getEmployeeCode() : "N/A",
                staff.getOffice() != null ? staff.getOffice().getName() : "Unknown Office");
        
        return StaffSelectDTO.builder()
                .id(staff.getId())
                .displayName(displayName)
                .build();
    }
}

