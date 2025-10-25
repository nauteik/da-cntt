package com.example.backend.service.impl;

import com.example.backend.model.dto.StaffSelectDTO;
import com.example.backend.model.dto.StaffSummaryDTO;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.dto.CreateStaffDTO;
import com.example.backend.model.dto.StaffCreatedDTO;
import com.example.backend.model.dto.StaffHeaderDTO;
import com.example.backend.model.dto.StaffPersonalDTO;
import com.example.backend.model.dto.StaffContactDTO;
import com.example.backend.model.dto.StaffAddressDTO;
import com.example.backend.model.dto.UpdateStaffIdentifiersDTO;
import com.example.backend.model.dto.UpdateStaffPersonalDTO;
import com.example.backend.model.dto.UpdateStaffAddressDTO;
import com.example.backend.model.dto.UpdateStaffContactDTO;
import com.example.backend.model.entity.Staff;
import com.example.backend.model.entity.StaffAddress;
import com.example.backend.model.entity.StaffContact;
import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Role;
import com.example.backend.model.entity.UserOffice;
import com.example.backend.model.enums.AddressType;
import com.example.backend.repository.StaffRepository;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.StaffAddressRepository;
import com.example.backend.repository.StaffContactRepository;
import com.example.backend.repository.AddressRepository;
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
import java.util.UUID;
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
    private final StaffAddressRepository staffAddressRepository;
    private final StaffContactRepository staffContactRepository;
    private final AddressRepository addressRepository;
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
            throw new com.example.backend.exception.ConflictException("Email already exists");
        }
        
        // 3. Check SSN uniqueness (if provided)
        if (createStaffDTO.getSsn() != null && !createStaffDTO.getSsn().trim().isEmpty()) {
            if (staffRepository.findBySsn(createStaffDTO.getSsn()).isPresent()) {
                throw new com.example.backend.exception.ConflictException("SSN already exists");
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
        staff.setNationalProviderId(createStaffDTO.getNationalProviderId());
        staff.setIsActive(true);
        staff.setHireDate(LocalDate.now());
        staff.setIsSupervisor(createStaffDTO.getIsSupervisor() != null ? createStaffDTO.getIsSupervisor() : false);
        
        // TODO: Consult partner on employeeId auto-generation
        // For now, generate a simple employee ID
        String employeeId = generateEmployeeId(office, staff);
        staff.setEmployeeId(employeeId);
        
        // Save Staff entity first
        Staff savedStaff = staffRepository.save(staff);
        
        // 8. Save phone number in StaffAddress (with null address) - AFTER staff is saved
        if (createStaffDTO.getPhone() != null && !createStaffDTO.getPhone().trim().isEmpty()) {
            StaffAddress staffAddress = new StaffAddress();
            staffAddress.setStaff(savedStaff); // Use saved staff with ID
            staffAddress.setAddress(null); // No address, only phone
            staffAddress.setPhone(createStaffDTO.getPhone());
            staffAddress.setEmail(createStaffDTO.getEmail());
            staffAddress.setIsMain(true); // Set as main contact phone
            staffAddressRepository.save(staffAddress);
            log.debug("Saved phone number for staff ID: {}", savedStaff.getId());
        }
        
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

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public StaffHeaderDTO getStaffHeader(UUID staffId) {
        log.debug("Fetching staff header for staff ID: {}", staffId);
        
        StaffHeaderDTO header = staffRepository.findStaffHeaderById(staffId);
        
        if (header == null) {
            log.warn("Staff header not found for ID: {}", staffId);
            throw new ResourceNotFoundException("Staff", staffId);
        }
        
        log.debug("Successfully fetched staff header for ID: {}", staffId);
        return header;
    }

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public StaffPersonalDTO getStaffPersonal(UUID staffId) {
        log.debug("Fetching staff personal information for staff ID: {}", staffId);
        
        Staff staff = staffRepository.findStaffPersonalById(staffId);
        
        if (staff == null) {
            log.warn("Staff not found for ID: {}", staffId);
            throw new ResourceNotFoundException("Staff", staffId);
        }
        
        // Map entity to DTO
        StaffPersonalDTO dto = new StaffPersonalDTO();
        dto.setId(staff.getId());
        dto.setSsn(staff.getSsn());
        dto.setStatus(staff.getIsActive() ? "Active" : "Inactive");
        dto.setEffectiveDate(staff.getHireDate());
        dto.setEmployeeId(staff.getEmployeeId());
        dto.setPosition(staff.getUser() != null && staff.getUser().getRole() != null ? 
                       staff.getUser().getRole().getName() : "Unknown");
        dto.setHireDate(staff.getHireDate());
        dto.setSupervisor(getSupervisorName(staff));
        dto.setSupervisorId(staff.getSupervisor() != null ? staff.getSupervisor().getId() : null);
        dto.setOfficeName(staff.getOffice() != null ? staff.getOffice().getName() : null);
        dto.setOfficeId(staff.getOffice() != null ? staff.getOffice().getId() : null);
        dto.setNationalProviderId(staff.getNationalProviderId());
        dto.setFirstName(staff.getFirstName());
        dto.setLastName(staff.getLastName());
        dto.setDob(staff.getDob());
        dto.setPrimaryLanguage(staff.getPrimaryLanguage());
        dto.setGender(staff.getGender());
        dto.setIsSupervisor(staff.getIsSupervisor());
        
        // Map contacts (primary first)
        List<StaffContactDTO> contacts = staff.getStaffContacts().stream()
            .sorted(Comparator.comparing((StaffContact c) -> Boolean.TRUE.equals(c.getIsPrimary()))
                .reversed())
            .map(contact -> {
                StaffContactDTO contactDTO = new StaffContactDTO();
                contactDTO.setId(contact.getId());
                contactDTO.setRelation(contact.getRelation());
                contactDTO.setName(contact.getName());
                contactDTO.setPhone(contact.getPhone());
                contactDTO.setEmail(contact.getEmail());
                contactDTO.setLine1(contact.getLine1());
                contactDTO.setLine2(contact.getLine2());
                contactDTO.setPrimary(contact.getIsPrimary());
                return contactDTO;
            })
            .collect(Collectors.toList());
        dto.setContacts(contacts);
        
        // Map addresses (main first)
        List<StaffAddressDTO> addresses = staff.getStaffAddresses().stream()
            .sorted(Comparator.comparing((StaffAddress sa) -> Boolean.TRUE.equals(sa.getIsMain()))
                .reversed())
            .map(staffAddress -> {
                StaffAddressDTO addressDTO = new StaffAddressDTO();
                addressDTO.setId(staffAddress.getId());
                if (staffAddress.getAddress() != null) {
                    addressDTO.setLine1(staffAddress.getAddress().getLine1());
                    addressDTO.setLine2(staffAddress.getAddress().getLine2());
                    addressDTO.setCity(staffAddress.getAddress().getCity());
                    addressDTO.setState(staffAddress.getAddress().getState());
                    addressDTO.setPostalCode(staffAddress.getAddress().getPostalCode());
                    addressDTO.setCounty(staffAddress.getAddress().getCounty());
                    addressDTO.setType(staffAddress.getAddress().getType().toString());
                    addressDTO.setLabel(staffAddress.getAddress().getLabel());
                }
                addressDTO.setPhone(staffAddress.getPhone());
                addressDTO.setEmail(staffAddress.getEmail());
                addressDTO.setMain(staffAddress.getIsMain());
                return addressDTO;
            })
            .collect(Collectors.toList());
        dto.setAddresses(addresses);
        
        log.debug("Successfully fetched staff personal information for ID: {}", staffId);
        return dto;
    }
    
    private String getSupervisorName(Staff staff) {
        // For now, return empty string as supervisor relationship needs to be implemented
        // TODO: Implement supervisor lookup when supervisor_id field is available
        return "";
    }

    @Override
    @Transactional
    public StaffPersonalDTO updateStaffIdentifiers(UUID staffId, UpdateStaffIdentifiersDTO updateDTO) {
        log.info("Updating identifiers for staff ID: {}", staffId);
        
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", staffId));
        
        // Update fields if provided
        if (updateDTO.getSsn() != null) {
            staff.setSsn(updateDTO.getSsn());
        }
        if (updateDTO.getEmployeeId() != null) {
            staff.setEmployeeId(updateDTO.getEmployeeId());
        }
        if (updateDTO.getNationalProviderId() != null) {
            staff.setNationalProviderId(updateDTO.getNationalProviderId());
        }
        if (updateDTO.getIsSupervisor() != null) {
            staff.setIsSupervisor(updateDTO.getIsSupervisor());
        }
        // Validate all entities first before making any changes
        Role newRole = null;
        if (updateDTO.getPosition() != null) {
            newRole = roleRepository.findByName(updateDTO.getPosition())
                    .orElseThrow(() -> new ResourceNotFoundException("Role", updateDTO.getPosition()));
        }
        
        Staff supervisor = null;
        if (updateDTO.getSupervisorId() != null) {
            supervisor = staffRepository.findById(updateDTO.getSupervisorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supervisor", updateDTO.getSupervisorId()));
        }
        
        Office office = null;
        if (updateDTO.getOfficeId() != null) {
            office = officeRepository.findById(updateDTO.getOfficeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Office", updateDTO.getOfficeId()));
        }
        
        // Now apply all changes after validation
        if (updateDTO.getPosition() != null && staff.getUser() != null) {
            staff.getUser().setRole(newRole);
        }
        if (updateDTO.getSupervisorId() != null) {
            staff.setSupervisor(supervisor);
        }
        if (updateDTO.getOfficeId() != null) {
            staff.setOffice(office);
        }
        
        // Save both entities
        staffRepository.save(staff);
        if (updateDTO.getPosition() != null && staff.getUser() != null) {
            appUserRepository.save(staff.getUser());
        }
        
        log.info("Successfully updated identifiers for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }

    @Override
    @Transactional
    public StaffPersonalDTO updateStaffPersonal(UUID staffId, UpdateStaffPersonalDTO updateDTO) {
        log.info("Updating personal information for staff ID: {}", staffId);
        
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", staffId));
        
        // Update fields if provided
        if (updateDTO.getFirstName() != null) {
            staff.setFirstName(updateDTO.getFirstName());
        }
        if (updateDTO.getLastName() != null) {
            staff.setLastName(updateDTO.getLastName());
        }
        if (updateDTO.getDob() != null) {
            staff.setDob(updateDTO.getDob());
        }
        if (updateDTO.getGender() != null) {
            staff.setGender(updateDTO.getGender());
        }
        if (updateDTO.getPrimaryLanguage() != null) {
            staff.setPrimaryLanguage(updateDTO.getPrimaryLanguage());
        }
        
        staffRepository.save(staff);
        
        log.info("Successfully updated personal information for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }

    @Override
    @Transactional
    public StaffPersonalDTO createStaffAddress(UUID staffId, UpdateStaffAddressDTO updateDTO) {
        log.info("Creating address for staff ID: {}", staffId);
        
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", staffId));
        
        // Create Address entity
        Address address = new Address();
        address.setLine1(updateDTO.getLine1());
        address.setLine2(updateDTO.getLine2());
        address.setCity(updateDTO.getCity());
        address.setState(updateDTO.getState());
        address.setPostalCode(updateDTO.getPostalCode());
        address.setCounty(updateDTO.getCounty());
        address.setType(updateDTO.getType());
        address.setLabel(updateDTO.getLabel());
        
        Address savedAddress = addressRepository.save(address);
        
        // Create StaffAddress mapping
        StaffAddress staffAddress = new StaffAddress();
        staffAddress.setStaff(staff);
        staffAddress.setAddress(savedAddress);
        staffAddress.setPhone(updateDTO.getPhone());
        staffAddress.setEmail(updateDTO.getEmail());
        staffAddress.setIsMain(updateDTO.getIsMain() != null ? updateDTO.getIsMain() : false);
        
        staffAddressRepository.save(staffAddress);
        
        log.info("Successfully created address for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }

    @Override
    @Transactional
    public StaffPersonalDTO updateStaffAddress(UUID staffId, UUID addressId, UpdateStaffAddressDTO updateDTO) {
        log.info("Updating address ID: {} for staff ID: {}", addressId, staffId);
        
        StaffAddress staffAddress = staffAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffAddress", addressId));
        
        // Verify the address belongs to the staff member
        if (!staffAddress.getStaff().getId().equals(staffId)) {
            throw new ResourceNotFoundException("StaffAddress", addressId);
        }
        
        Address address = staffAddress.getAddress();
        if (address != null) {
            // Update Address entity fields if provided
            if (updateDTO.getLine1() != null) {
                address.setLine1(updateDTO.getLine1());
            }
            if (updateDTO.getLine2() != null) {
                address.setLine2(updateDTO.getLine2());
            }
            if (updateDTO.getCity() != null) {
                address.setCity(updateDTO.getCity());
            }
            if (updateDTO.getState() != null) {
                address.setState(updateDTO.getState());
            }
            if (updateDTO.getPostalCode() != null) {
                address.setPostalCode(updateDTO.getPostalCode());
            }
            if (updateDTO.getCounty() != null) {
                address.setCounty(updateDTO.getCounty());
            }
            if (updateDTO.getType() != null) {
                address.setType(updateDTO.getType());
            }
            if (updateDTO.getLabel() != null) {
                address.setLabel(updateDTO.getLabel());
            }
            addressRepository.save(address);
        }
        
        // Update StaffAddress fields if provided
        if (updateDTO.getPhone() != null) {
            staffAddress.setPhone(updateDTO.getPhone());
        }
        if (updateDTO.getEmail() != null) {
            staffAddress.setEmail(updateDTO.getEmail());
        }
        if (updateDTO.getIsMain() != null) {
            staffAddress.setIsMain(updateDTO.getIsMain());
        }
        
        staffAddressRepository.save(staffAddress);
        
        log.info("Successfully updated address for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }

    @Override
    @Transactional
    public StaffPersonalDTO deleteStaffAddress(UUID staffId, UUID addressId) {
        log.info("Deleting address ID: {} for staff ID: {}", addressId, staffId);
        
        StaffAddress staffAddress = staffAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffAddress", addressId));
        
        // Verify the address belongs to the staff member
        if (!staffAddress.getStaff().getId().equals(staffId)) {
            throw new ResourceNotFoundException("StaffAddress", addressId);
        }
        
        // Get the associated Address entity before deleting StaffAddress
        Address address = staffAddress.getAddress();
        
        // Delete StaffAddress first
        staffAddressRepository.delete(staffAddress);
        
        // Delete Address entity if it exists
        if (address != null) {
            addressRepository.delete(address);
        }
        
        log.info("Successfully deleted address for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }

    @Override
    @Transactional
    public StaffPersonalDTO createStaffContact(UUID staffId, UpdateStaffContactDTO updateDTO) {
        log.info("Creating contact for staff ID: {}", staffId);
        
        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff", staffId));
        
        // Create StaffContact entity
        StaffContact staffContact = new StaffContact();
        staffContact.setStaff(staff);
        staffContact.setRelation(updateDTO.getRelation());
        staffContact.setName(updateDTO.getName());
        staffContact.setPhone(updateDTO.getPhone());
        staffContact.setEmail(updateDTO.getEmail());
        staffContact.setLine1(updateDTO.getLine1());
        staffContact.setLine2(updateDTO.getLine2());
        staffContact.setIsPrimary(updateDTO.getIsPrimary() != null ? updateDTO.getIsPrimary() : false);
        
        staffContactRepository.save(staffContact);
        
        log.info("Successfully created contact for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }

    @Override
    @Transactional
    public StaffPersonalDTO updateStaffContact(UUID staffId, UUID contactId, UpdateStaffContactDTO updateDTO) {
        log.info("Updating contact ID: {} for staff ID: {}", contactId, staffId);
        
        StaffContact staffContact = staffContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffContact", contactId));
        
        // Verify the contact belongs to the staff member
        if (!staffContact.getStaff().getId().equals(staffId)) {
            throw new ResourceNotFoundException("StaffContact", contactId);
        }
        
        // Update fields if provided
        if (updateDTO.getRelation() != null) {
            staffContact.setRelation(updateDTO.getRelation());
        }
        if (updateDTO.getName() != null) {
            staffContact.setName(updateDTO.getName());
        }
        if (updateDTO.getPhone() != null) {
            staffContact.setPhone(updateDTO.getPhone());
        }
        if (updateDTO.getEmail() != null) {
            staffContact.setEmail(updateDTO.getEmail());
        }
        if (updateDTO.getLine1() != null) {
            staffContact.setLine1(updateDTO.getLine1());
        }
        if (updateDTO.getLine2() != null) {
            staffContact.setLine2(updateDTO.getLine2());
        }
        if (updateDTO.getIsPrimary() != null) {
            staffContact.setIsPrimary(updateDTO.getIsPrimary());
        }
        
        staffContactRepository.save(staffContact);
        
        log.info("Successfully updated contact for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }

    @Override
    @Transactional
    public StaffPersonalDTO deleteStaffContact(UUID staffId, UUID contactId) {
        log.info("Deleting contact ID: {} for staff ID: {}", contactId, staffId);
        
        StaffContact staffContact = staffContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("StaffContact", contactId));
        
        // Verify the contact belongs to the staff member
        if (!staffContact.getStaff().getId().equals(staffId)) {
            throw new ResourceNotFoundException("StaffContact", contactId);
        }
        
        staffContactRepository.delete(staffContact);
        
        log.info("Successfully deleted contact for staff ID: {}", staffId);
        return getStaffPersonal(staffId);
    }
}

