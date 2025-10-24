package com.example.backend.service.impl;

import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.StaffSummaryDTO;
import com.example.backend.model.dto.CreateStaffDTO;
import com.example.backend.model.dto.StaffCreatedDTO;
import com.example.backend.model.entity.Staff;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Role;
import com.example.backend.model.entity.UserOffice;
import com.example.backend.repository.StaffRepository;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserOfficeRepository;
import com.example.backend.service.StaffService;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Implementation of StaffService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final AppUserRepository appUserRepository;
    private final OfficeRepository officeRepository;
    private final RoleRepository roleRepository;
    private final UserOfficeRepository userOfficeRepository;
    private final PasswordEncoder passwordEncoder;
    
    // Whitelist of allowed sort fields to prevent SQL injection via sort parameter
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
        "name", "firstName", "lastName", "employeeId", "position", 
        "hireDate", "releaseDate", "updatedAt", "status"
    );
    
    private static final Set<String> ALLOWED_SORT_DIRECTIONS = Set.of("asc", "desc");

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

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public Page<StaffSummaryDTO> getStaffSummaries(
            String search, 
            List<String> status, 
            List<String> role,
            int page, 
            int size, 
            String sortBy, 
            String sortDir) {
        
        // Validate sortBy against whitelist to prevent SQL injection
        if (sortBy != null && !sortBy.isEmpty() && !ALLOWED_SORT_FIELDS.contains(sortBy)) {
            log.warn("Invalid sort field requested: {}", sortBy);
            throw new com.example.backend.exception.InvalidSortFieldException(sortBy, ALLOWED_SORT_FIELDS);
        }
        
        // Validate sortDir
        if (sortDir != null && !ALLOWED_SORT_DIRECTIONS.contains(sortDir.toLowerCase())) {
            log.warn("Invalid sort direction requested: {}", sortDir);
            throw new IllegalArgumentException("Invalid sort direction: '" + sortDir + "'. Use 'asc' or 'desc'");
        }
        
        // Create pageable with or without sort
        Pageable pageable;
        if (sortBy != null && !sortBy.isEmpty()) {
            // Create Sort object only if sortBy is provided
            org.springframework.data.domain.Sort.Direction direction = 
                sortDir.equalsIgnoreCase("desc") 
                    ? org.springframework.data.domain.Sort.Direction.DESC 
                    : org.springframework.data.domain.Sort.Direction.ASC;
            org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(direction, sortBy);
            pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);
        } else {
            // Default sorting by updated_at DESC (newest first)
            org.springframework.data.domain.Sort defaultSort = org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "updated_at"
            );
            pageable = org.springframework.data.domain.PageRequest.of(page, size, defaultSort);
        }
        
        return getStaffSummaries(search, status, role, pageable);
    }
    
    /**
     * Internal method to fetch staff summaries with pre-constructed Pageable.
     * Kept for backwards compatibility and internal use.
     */
    private Page<StaffSummaryDTO> getStaffSummaries(String search, List<String> status, List<String> role, Pageable pageable) {
        long startTime = System.currentTimeMillis();
        
        log.debug("Fetching staff summaries with search: '{}', status: {}, page: {}, size: {}", 
            search, status, pageable.getPageNumber(), pageable.getPageSize());
        
        // Convert status list to comma-separated string for native query compatibility
        String statusFilter = (status != null && !status.isEmpty()) 
            ? String.join(",", status) 
            : null;
        
        // Convert role list to comma-separated string for native query compatibility
        String roleFilter = (role != null && !role.isEmpty()) 
            ? String.join(",", role) 
            : null;
        
        // Extract sort information from Pageable
        // No default sorting - only sort if user explicitly requests it
        String sortColumn = null;
        String sortDirection = "asc";
        
        if (pageable.getSort().isSorted()) {
            org.springframework.data.domain.Sort.Order order = pageable.getSort().iterator().next();
            sortColumn = order.getProperty();
            sortDirection = order.getDirection().isAscending() ? "asc" : "desc";
        }
        
        // Calculate limit and offset for manual pagination
        int limit = pageable.getPageSize();
        int offset = pageable.getPageNumber() * pageable.getPageSize();
        
        // Fetch data and count separately
        List<StaffSummaryDTO> content = staffRepository.findStaffSummariesList(
            search, 
            statusFilter, 
            roleFilter,
            sortColumn,
            sortDirection,
            limit,
            offset
        );
        
        long total = staffRepository.countStaffSummaries(search, statusFilter, roleFilter);
        
        // Manually construct Page object
        Page<StaffSummaryDTO> staffPage = new PageImpl<>(content, pageable, total);
        
        long duration = System.currentTimeMillis() - startTime;
        log.info("Fetched {} staff out of {} total in {}ms (page {}/{})", 
            content.size(), total, duration, pageable.getPageNumber() + 1, staffPage.getTotalPages());
        
        return staffPage;
    }

    @Override
    @Transactional
    public StaffCreatedDTO createStaff(CreateStaffDTO createStaffDTO, String authenticatedUserEmail) {
        log.info("Creating staff member: {} {}", createStaffDTO.getFirstName(), createStaffDTO.getLastName());
        
        // 1. Validate office exists
        Office office = officeRepository.findById(createStaffDTO.getOfficeId())
                .orElseThrow(() -> new com.example.backend.exception.ResourceNotFoundException("Office not found"));
        
        // 2. Check email uniqueness
        if (appUserRepository.findByEmail(createStaffDTO.getEmail()).isPresent()) {
            throw new com.example.backend.exception.ConflictException("Email already exists: " + createStaffDTO.getEmail());
        }
        
        // 3. Check SSN uniqueness (if provided)
        if (createStaffDTO.getSsn() != null && !createStaffDTO.getSsn().trim().isEmpty()) {
            if (staffRepository.findBySsn(createStaffDTO.getSsn()).isPresent()) {
                throw new com.example.backend.exception.ConflictException("SSN already exists: " + createStaffDTO.getSsn());
            }
        }
        
        // 4. Hash password "123456" using PasswordEncoder
        String hashedPassword = passwordEncoder.encode("123456");
        
        // 5. Validate role exists
        Role role = roleRepository.findById(createStaffDTO.getRoleId())
                .orElseThrow(() -> new com.example.backend.exception.ResourceNotFoundException("Role not found"));
        
        // 6. Create AppUser entity
        AppUser appUser = new AppUser(createStaffDTO.getEmail(), hashedPassword, role);
        appUser.setIsActive(true);
        AppUser savedUser = appUserRepository.save(appUser);
        
        // 7. Create Staff entity linked to user and office
        Staff staff = new Staff(office, createStaffDTO.getFirstName(), createStaffDTO.getLastName());
        staff.setUser(savedUser);
        staff.setSsn(createStaffDTO.getSsn());
        staff.setIsActive(true);
        staff.setHireDate(LocalDate.now());
        
        // TODO: Consult partner on employeeId auto-generation
        // For now, generate a simple employee ID
        String employeeId = generateEmployeeId(office, staff);
        staff.setEmployeeId(employeeId);
        
        Staff savedStaff = staffRepository.save(staff);
        
        // 8. Create UserOffice mapping
        UserOffice userOffice = new UserOffice(savedUser, office);
        userOfficeRepository.save(userOffice);
        
        log.info("Successfully created staff member: {} with ID: {}", 
                savedStaff.getFullName(), savedStaff.getId());
        
        // 9. Return StaffCreatedDTO
        return new StaffCreatedDTO(
                savedStaff.getId(),
                savedStaff.getFirstName(),
                savedStaff.getLastName(),
                savedStaff.getEmployeeId(),
                savedUser.getEmail(),
                office.getName(),
                LocalDate.now()
        );
    }
    
    /**
     * Generate employee ID based on office and sequence
     * TODO: Consult partner on employeeId generation strategy
     */
    private String generateEmployeeId(Office office, Staff staff) {
        // Simple implementation: OFFICE_CODE + sequence number
        String officeCode = office.getCode() != null ? office.getCode() : "OFF";
        long staffCount = staffRepository.count();
        return String.format("%s%03d", officeCode, staffCount + 1);
    }

    /**
     * Map Staff entity to StaffSelectDTO
     * Format: "FirstName LastName (EmployeeCode) - OfficeName"
     */
    private StaffSelectDTO mapToSelectDTO(Staff staff) {
        String displayName = String.format("%s %s (%s) - %s",
                staff.getFirstName(),
                staff.getLastName(),
                staff.getEmployeeId() != null ? staff.getEmployeeId() : "N/A",
                staff.getOffice() != null ? staff.getOffice().getName() : "Unknown Office");
        
        return StaffSelectDTO.builder()
                .id(staff.getId())
                .displayName(displayName)
                .build();
    }
}

