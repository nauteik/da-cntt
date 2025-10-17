package com.example.backend.service.impl;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.dto.AddressDTO;
import com.example.backend.model.dto.ContactDTO;
import com.example.backend.model.dto.PatientCreatedDTO;
import com.example.backend.model.dto.PatientHeaderDTO;
import com.example.backend.model.dto.PatientPersonalDTO;
import com.example.backend.model.dto.PatientSummaryDTO;
import com.example.backend.model.dto.CreatePatientDTO;
import com.example.backend.model.dto.UpdatePatientIdentifiersDTO;
import com.example.backend.model.dto.UpdatePatientPersonalDTO;
import com.example.backend.model.dto.UpdatePatientAddressDTO;
import com.example.backend.model.dto.UpdatePatientContactDTO;
import com.example.backend.model.dto.PatientProgramDTO;
import com.example.backend.model.dto.UpdatePatientProgramDTO;
import com.example.backend.model.dto.CreatePatientServiceDTO;
import com.example.backend.model.dto.UpdatePatientServiceDTO;
import com.example.backend.model.dto.ProgramDetailDTO;
import com.example.backend.model.dto.PayerDetailDTO;
import com.example.backend.model.dto.ServiceDetailDTO;
import com.example.backend.model.dto.AuthorizationDTO;
import com.example.backend.model.dto.PayerAuthorizationDTO;
import com.example.backend.model.dto.CreatePatientPayerDTO;
import com.example.backend.model.dto.UpdatePatientPayerDTO;
import com.example.backend.model.dto.CreateAuthorizationDTO;
import com.example.backend.model.dto.UpdateAuthorizationDTO;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.PatientContact;
import com.example.backend.model.enums.Gender;
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.PatientContactRepository;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.PayerRepository;
import com.example.backend.repository.ProgramRepository;
import com.example.backend.repository.PatientProgramRepository;
import com.example.backend.repository.PatientPayerRepository;
import com.example.backend.repository.PatientServiceRepository;
import com.example.backend.repository.AuthorizationRepository;
import com.example.backend.repository.ServiceTypeRepository;
import org.springframework.dao.DataIntegrityViolationException;
import com.example.backend.repository.PatientAddressRepository;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Staff;
import com.example.backend.model.entity.PatientAddress;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Payer;
import com.example.backend.model.entity.Program;
import com.example.backend.model.entity.UserOffice;
import com.example.backend.model.entity.PatientProgram;
import com.example.backend.model.entity.PatientPayer;
import com.example.backend.model.enums.PatientStatus;
import java.lang.Boolean;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of PatientService
 * Uses optimized database-level aggregation for efficient pagination
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PatientServiceImpl implements com.example.backend.service.PatientService {

    private final PatientRepository patientRepository;
    private final ProgramRepository programRepository;
    private final PayerRepository payerRepository;
    private final OfficeRepository officeRepository;
    private final AppUserRepository appUserRepository;
    private final StaffRepository staffRepository;
    private final PatientProgramRepository patientProgramRepository;
    private final PatientPayerRepository patientPayerRepository;
    private final PatientServiceRepository patientServiceRepository;
    private final AuthorizationRepository authorizationRepository;
    private final PatientAddressRepository patientAddressRepository;
    private final PatientContactRepository patientContactRepository;
    private final AddressRepository addressRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    
    // Whitelist of allowed sort fields to prevent SQL injection via sort parameter
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
        "clientName", "firstName", "lastName", "status", "medicaidId",
        "asOf", "soc", "eoc", "first_name", "last_name", "medicaid_id",
        "as_of", "soc_date", "eoc_date", "created_at", "createdAt"
    );
    
    private static final Set<String> ALLOWED_SORT_DIRECTIONS = Set.of("asc", "desc");

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public Page<PatientSummaryDTO> getPatientSummaries(
            String search, 
            List<String> status, 
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
            // Default sorting by created_at DESC (newest first)
            org.springframework.data.domain.Sort defaultSort = org.springframework.data.domain.Sort.by(
                org.springframework.data.domain.Sort.Direction.DESC, "created_at"
            );
            pageable = org.springframework.data.domain.PageRequest.of(page, size, defaultSort);
        }
        
        return getPatientSummaries(search, status, pageable);
    }
    
    /**
     * Internal method to fetch patient summaries with pre-constructed Pageable.
     * Kept for backwards compatibility and internal use.
     */
    private Page<PatientSummaryDTO> getPatientSummaries(String search, List<String> status, Pageable pageable) {
        long startTime = System.currentTimeMillis();
        
        log.debug("Fetching patient summaries with search: '{}', status: {}, page: {}, size: {}", 
            search, status, pageable.getPageNumber(), pageable.getPageSize());
        
        // Convert status list to comma-separated string for native query compatibility
        String statusFilter = (status != null && !status.isEmpty()) 
            ? String.join(",", status) 
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
        List<PatientSummaryDTO> content = patientRepository.findPatientSummariesList(
            search, 
            statusFilter, 
            sortColumn,
            sortDirection,
            limit,
            offset
        );
        
        long total = patientRepository.countPatientSummaries(search, statusFilter);
        
        // Manually construct Page object
        Page<PatientSummaryDTO> patientPage = new PageImpl<>(content, pageable, total);
        
        long duration = System.currentTimeMillis() - startTime;
        log.info("Fetched {} patients out of {} total in {}ms (page {}/{})", 
            content.size(), total, duration, pageable.getPageNumber() + 1, patientPage.getTotalPages());
        
        return patientPage;
    }

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public PatientHeaderDTO getPatientHeader(UUID patientId) {
        log.debug("Fetching patient header for patient ID: {}", patientId);
        
        PatientHeaderDTO header = patientRepository.findPatientHeaderById(patientId);
        
        if (header == null) {
            log.warn("Patient header not found for ID: {}", patientId);
            throw new ResourceNotFoundException("Patient", patientId);
        }
        
        log.debug("Successfully fetched patient header for ID: {}", patientId);
        return header;
    }

    @Override
    @Transactional(readOnly = true, isolation = org.springframework.transaction.annotation.Isolation.READ_COMMITTED)
    public PatientPersonalDTO getPatientPersonal(UUID patientId) {
        log.debug("Fetching patient personal information for patient ID: {}", patientId);
        
        Patient patient = patientRepository.findPatientPersonalById(patientId);
        
        if (patient == null) {
            log.warn("Patient not found for ID: {}", patientId);
            throw new ResourceNotFoundException("Patient", patientId);
        }
        
        // Map entity to DTO
        PatientPersonalDTO dto = new PatientPersonalDTO();
        dto.setId(patient.getId());
        dto.setMedicaidId(patient.getMedicaidId());
        dto.setClientId(patient.getClientId());
        dto.setAgencyId(patient.getAgencyId());
        dto.setSsn(patient.getSsn());
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setDob(patient.getDob());
        dto.setGender(patient.getGender());
        dto.setPrimaryLanguage(patient.getPrimaryLanguage());
        dto.setMedicalProfile(patient.getMedicalProfile());
        
        // Map contacts (primary first)
        List<ContactDTO> contacts = patient.getContacts().stream()
            .sorted(java.util.Comparator
                .comparing((PatientContact c) -> Boolean.TRUE.equals(c.getIsPrimary()))
                .reversed())
            .map(contact -> {
                ContactDTO contactDTO = new ContactDTO();
                contactDTO.setId(contact.getId());
                contactDTO.setRelation(contact.getRelation());
                contactDTO.setName(contact.getName());
                contactDTO.setPhone(contact.getPhone());
                contactDTO.setEmail(contact.getEmail());
                contactDTO.setPrimary(contact.getIsPrimary());
                return contactDTO;
            })
            .collect(Collectors.toList());
        dto.setContacts(contacts);
        
        // Map addresses (main first)
        List<AddressDTO> addresses = patient.getPatientAddresses().stream()
            .sorted(java.util.Comparator
                .comparing((PatientAddress pa) -> Boolean.TRUE.equals(pa.getIsMain()))
                .reversed())
            .map(patientAddress -> {
                AddressDTO addressDTO = new AddressDTO();
                addressDTO.setId(patientAddress.getId());
                if (patientAddress.getAddress() != null) {
                    addressDTO.setLabel(patientAddress.getAddress().getLabel());
                    addressDTO.setType(patientAddress.getAddress().getType());
                    addressDTO.setLine1(patientAddress.getAddress().getLine1());
                    addressDTO.setLine2(patientAddress.getAddress().getLine2());
                    addressDTO.setCity(patientAddress.getAddress().getCity());
                    addressDTO.setState(patientAddress.getAddress().getState());
                    addressDTO.setPostalCode(patientAddress.getAddress().getPostalCode());
                    addressDTO.setCounty(patientAddress.getAddress().getCounty());
                }
                addressDTO.setPhone(patientAddress.getPhone());
                addressDTO.setEmail(patientAddress.getEmail());
                addressDTO.setMain(patientAddress.getIsMain());
                return addressDTO;
            })
            .collect(Collectors.toList());
        dto.setAddresses(addresses);
        
        log.debug("Successfully fetched patient personal information for ID: {}", patientId);
        return dto;
    }

    @Override
    @Transactional
    public PatientCreatedDTO createPatient(CreatePatientDTO createPatientDTO, String authenticatedUserEmail) {
        log.info("Creating new patient with medicaid ID: {}", createPatientDTO.getMedicaidId());
        
        // 1. Check if medicaid ID already exists
        if (patientRepository.existsByMedicaidId(createPatientDTO.getMedicaidId())) {
            log.warn("Attempt to create patient with duplicate medicaid ID: {}", createPatientDTO.getMedicaidId());
            throw new ConflictException("Medicaid ID '" + createPatientDTO.getMedicaidId() + "' already exists");
        }
        
        // 2. Find and validate program by identifier
        Program program = programRepository.findByProgramIdentifier(createPatientDTO.getProgramIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Program '" + createPatientDTO.getProgramIdentifier() + "' not found"));
        
        if (!program.isActive()) {
            log.warn("Attempt to create patient with inactive program: {}", createPatientDTO.getProgramIdentifier());
            throw new IllegalArgumentException("Program '" + createPatientDTO.getProgramIdentifier() + "' is not active");
        }
        
        // 3. Find and validate payer by identifier
        Payer payer = payerRepository.findByPayerIdentifier(createPatientDTO.getPayerIdentifier())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payer '" + createPatientDTO.getPayerIdentifier() + "' not found"));
        
        if (!payer.isActivePayer()) {
            log.warn("Attempt to create patient with inactive payer: {}", createPatientDTO.getPayerIdentifier());
            throw new IllegalArgumentException("Payer '" + createPatientDTO.getPayerIdentifier() + "' is not active");
        }
        
        // 4. Determine office: use provided officeId or get from authenticated user
        Office office;
        if (createPatientDTO.getOfficeId() != null) {
            office = officeRepository.findById(createPatientDTO.getOfficeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Office", createPatientDTO.getOfficeId()));
        } else {
            // Get office from authenticated user's first office assignment
            AppUser user = appUserRepository.findByEmail(authenticatedUserEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("User with email '" + authenticatedUserEmail + "' not found"));
            
            office = user.getUserOffices().stream()
                    .findFirst()
                    .map(UserOffice::getOffice)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user has no office assignment"));
        }
        
        // 5. Create patient entity
        Patient patient = new Patient();
        patient.setFirstName(createPatientDTO.getFirstName());
        patient.setLastName(createPatientDTO.getLastName());
        patient.setMedicaidId(createPatientDTO.getMedicaidId());
        patient.setOffice(office);
        patient.setStatus(PatientStatus.PENDING); // Default status for new patients
        
        // 6. Save patient
        Patient savedPatient = patientRepository.save(patient);
        
        // 7. Generate client ID (can be customized based on business rules)
        // For now, using simple format: last 6 chars of UUID
        savedPatient.setClientId("CL-" + savedPatient.getId().toString().substring(0, 6).toUpperCase());
        savedPatient = patientRepository.save(savedPatient);
        
        // 8. Create and save PatientProgram
        PatientProgram patientProgram = new PatientProgram();
        patientProgram.setPatient(savedPatient);
        patientProgram.setProgram(program);
        patientProgram.setEnrollmentDate(LocalDate.now());
        patientProgram.setStatusEffectiveDate(LocalDate.now());
        patientProgramRepository.save(patientProgram);
        
        // 9. Create and save PatientPayer
        PatientPayer patientPayer = new PatientPayer();
        patientPayer.setPatient(savedPatient);
        patientPayer.setPayer(payer);
        patientPayer.setClientPayerId(createPatientDTO.getMedicaidId()); // Using medicaidId as clientPayerId for now
        patientPayer.setRank(1); // Primary payer
        patientPayer.setStartDate(LocalDate.now());
        patientPayerRepository.save(patientPayer);
        
        // 10. Save phone number in PatientAddress (with null address)
        if (createPatientDTO.getPhone() != null && !createPatientDTO.getPhone().trim().isEmpty()) {
            PatientAddress patientAddress = new PatientAddress();
            patientAddress.setPatient(savedPatient);
            patientAddress.setAddress(null); // No address, only phone
            patientAddress.setPhone(createPatientDTO.getPhone());
            patientAddress.setIsMain(true); // Set as main contact phone
            patientAddressRepository.save(patientAddress);
            log.debug("Saved phone number for patient ID: {}", savedPatient.getId());
        }
        
        log.info("Successfully created patient with ID: {} and medicaid ID: {}", 
                savedPatient.getId(), savedPatient.getMedicaidId());
        
        // 11. Map to response DTO
        PatientCreatedDTO response = new PatientCreatedDTO();
        response.setId(savedPatient.getId());
        response.setFirstName(savedPatient.getFirstName());
        response.setLastName(savedPatient.getLastName());
        response.setMedicaidId(savedPatient.getMedicaidId());
        response.setClientId(savedPatient.getClientId());
        response.setStatus(savedPatient.getStatus());
        response.setOfficeName(office.getName());
        response.setProgramName(program.getProgramName());
        response.setPayerName(payer.getPayerName());
        response.setCreatedAt(LocalDate.now());
        
        return response;
    }

    @Override
    @Transactional
    public PatientHeaderDTO updatePatientIdentifiers(UUID patientId, UpdatePatientIdentifiersDTO updateDTO) {
        log.info("Updating identifiers for patient ID: {}", patientId);
        
        // 1. Find patient
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));
        
        // 2. Update only provided fields (true PATCH semantics)
        
        // Update Client ID if provided
        if (updateDTO.getClientId() != null) {
            String clientId = updateDTO.getClientId().trim();
            // Check if client ID already exists for another patient
            patientRepository.findByClientId(clientId)
                    .ifPresent(existingPatient -> {
                        if (!existingPatient.getId().equals(patientId)) {
                            log.warn("Attempt to update patient with duplicate client ID: {}", clientId);
                            throw new ConflictException("Client ID '" + clientId + "' already exists");
                        }
                    });
            patient.setClientId(clientId);
        }
        
        // Update Medicaid ID if provided
        if (updateDTO.getMedicaidId() != null) {
            String medicaidId = updateDTO.getMedicaidId().trim();
            // Check if medicaid ID already exists for another patient
            if (!java.util.Objects.equals(patient.getMedicaidId(), medicaidId) && 
                patientRepository.existsByMedicaidId(medicaidId)) {
                log.warn("Attempt to update patient with duplicate medicaid ID: {}", medicaidId);
                throw new ConflictException("Medicaid ID '" + medicaidId + "' already exists");
            }
            patient.setMedicaidId(medicaidId);
        }
        
        // Update SSN if provided
        if (updateDTO.getSsn() != null) {
            String ssn = updateDTO.getSsn().trim();
            if (!ssn.isEmpty()) {
                // Check if SSN already exists for another patient
                patientRepository.findBySsn(ssn)
                        .ifPresent(existingPatient -> {
                            if (!existingPatient.getId().equals(patientId)) {
                                log.warn("Attempt to update patient with duplicate SSN");
                                throw new ConflictException("SSN already exists for another patient");
                            }
                        });
            }
            patient.setSsn(ssn);
        }
        
        // Update Agency ID if provided
        if (updateDTO.getAgencyId() != null) {
            patient.setAgencyId(updateDTO.getAgencyId().trim());
        }
        
        // 3. Save patient with database-level uniqueness protection
        try {
            patientRepository.save(patient);
            log.info("Successfully updated identifiers for patient ID: {}", patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while updating identifiers for patient {}: {}", 
                    patientId, ex.getMessage());
            throw new ConflictException("Update failed due to unique constraint violation. " +
                "Another patient may have been assigned the same identifier concurrently.");
        }
        
        // 4. Return updated patient header
        return getPatientHeader(patientId);
    }

    @Override
    @Transactional
    public PatientPersonalDTO updatePatientPersonal(UUID patientId, UpdatePatientPersonalDTO updateDTO) {
        log.info("Updating personal information for patient ID: {}", patientId);

        // 1. Find patient with all necessary relationships
        Patient patient = patientRepository.findPatientPersonalById(patientId);
        
        if (patient == null) {
            throw new ResourceNotFoundException("Patient", patientId);
        }
        
        // 2. Update only provided fields (true PATCH semantics)
        
        // Update First Name if provided
        if (updateDTO.getFirstName() != null) {
            patient.setFirstName(updateDTO.getFirstName().trim());
        }
        
        // Update Last Name if provided
        if (updateDTO.getLastName() != null) {
            patient.setLastName(updateDTO.getLastName().trim());
        }
        
        // Update Date of Birth if provided
        if (updateDTO.getDob() != null) {
            patient.setDob(updateDTO.getDob());
        }
        
        // Update Gender if provided
        if (updateDTO.getGender() != null) {
            String genderInput = updateDTO.getGender().trim();
            if (!genderInput.isEmpty()) {
                try {
                    // Use the enum for validation but store the label
                    Gender gender = Gender.fromLabel(genderInput);
                    patient.setGender(gender.getLabel()); // Always stores "Male" or "Female" with proper case
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Gender must be either 'Male' or 'Female'");
                }
            } else {
                patient.setGender(null); // Allow clearing gender
            }
        }
        
        // Update Primary Language if provided
        if (updateDTO.getPrimaryLanguage() != null) {
            patient.setPrimaryLanguage(updateDTO.getPrimaryLanguage().trim());
        }
        
        // 3. Save patient with database-level protection
        try {
            patientRepository.save(patient);
            log.info("Successfully updated personal information for patient ID: {}", patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while updating personal info for patient {}: {}", 
                     patientId, ex.getMessage());
            throw new ConflictException("Update failed due to constraint violation.");
        }
        
        // 4. Return updated patient personal information
        return getPatientPersonal(patientId);
    }

    @Override
    @Transactional
    public PatientPersonalDTO createPatientAddress(UUID patientId, UpdatePatientAddressDTO updateDTO) {
        log.info("Creating address for patient ID: {}", patientId);
        
        // 1. Validate required fields for creation
        if (updateDTO.getLine1() == null || updateDTO.getLine1().trim().isEmpty()) {
            throw new IllegalArgumentException("Address line 1 is required");
        }
        if (updateDTO.getCity() == null || updateDTO.getCity().trim().isEmpty()) {
            throw new IllegalArgumentException("City is required");
        }
        if (updateDTO.getState() == null || updateDTO.getState().trim().isEmpty()) {
            throw new IllegalArgumentException("State is required");
        }
        if (updateDTO.getPostalCode() == null || updateDTO.getPostalCode().trim().isEmpty()) {
            throw new IllegalArgumentException("Postal code is required");
        }
        if (updateDTO.getCounty() == null || updateDTO.getCounty().trim().isEmpty()) {
            throw new IllegalArgumentException("County is required");
        }
        if (updateDTO.getPhone() == null || updateDTO.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone is required");
        }
        
        // 2. Verify patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }
        
        // 3. Create new Address entity (always create new, no sharing)
        Address address = new Address();
        address.setLine1(updateDTO.getLine1().trim());
        address.setLine2(updateDTO.getLine2() != null ? updateDTO.getLine2().trim() : null);
        address.setLabel(updateDTO.getLabel() != null ? updateDTO.getLabel().trim() : null);
        address.setCity(updateDTO.getCity().trim());
        address.setState(updateDTO.getState().trim());
        address.setPostalCode(updateDTO.getPostalCode().trim());
        address.setCounty(updateDTO.getCounty().trim());
        address.setType(updateDTO.getType());
        
        // 4. Save Address
        Address savedAddress = addressRepository.save(address);
        
        // 5. If isMain is true, unset other main addresses for this patient BEFORE creating new one
        if (Boolean.TRUE.equals(updateDTO.getIsMain())) {
            // Query directly from repository to get current main addresses from database
            List<PatientAddress> mainAddresses = patientAddressRepository.findMainAddressesByPatientId(patientId);
            if (!mainAddresses.isEmpty()) {
                mainAddresses.forEach(pa -> pa.setIsMain(false));
                patientAddressRepository.saveAll(mainAddresses); // Batch update
                patientAddressRepository.flush(); // Force immediate execution to database
            }
        }
        
        // 6. Create PatientAddress join entity
        PatientAddress patientAddress = new PatientAddress();
        patientAddress.setPatient(patientRepository.getReferenceById(patientId)); // Use reference instead of loading entire entity
        patientAddress.setAddress(savedAddress);
        patientAddress.setPhone(updateDTO.getPhone().trim());
        patientAddress.setEmail(updateDTO.getEmail() != null && !updateDTO.getEmail().trim().isEmpty() 
                ? updateDTO.getEmail().trim() : null);
        patientAddress.setIsMain(updateDTO.getIsMain() != null ? updateDTO.getIsMain() : false);
        
        // 7. Save PatientAddress
        try {
            patientAddressRepository.save(patientAddress);
            log.info("Successfully created address for patient ID: {}", patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while creating address for patient {}: {}", 
                    patientId, ex.getMessage());
            throw new ConflictException("Failed to create address due to constraint violation.");
        }
        
        // 8. Return updated patient personal information
        return getPatientPersonal(patientId);
    }

    @Override
    @Transactional
    public PatientPersonalDTO updatePatientAddress(UUID patientId, UUID addressId, UpdatePatientAddressDTO updateDTO) {
        log.info("Updating address ID: {} for patient ID: {}", addressId, patientId);
        
        // 1. Find PatientAddress
        PatientAddress patientAddress = patientAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("PatientAddress", addressId));
        
        // 2. Verify that this address belongs to this patient
        if (!patientAddress.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Address does not belong to this patient");
        }
        
        // 4. Update Address entity fields (safe since not shared)
        if (patientAddress.getAddress() != null) {
            Address address = patientAddress.getAddress();
            
            if (updateDTO.getLine1() != null) {
                address.setLine1(updateDTO.getLine1().trim());
            }
            if (updateDTO.getLine2() != null) {
                address.setLine2(updateDTO.getLine2().trim());
            }
            if (updateDTO.getLabel() != null) {
                address.setLabel(updateDTO.getLabel().trim());
            }
            if (updateDTO.getCity() != null) {
                address.setCity(updateDTO.getCity().trim());
            }
            if (updateDTO.getState() != null) {
                address.setState(updateDTO.getState().trim());
            }
            if (updateDTO.getPostalCode() != null) {
                address.setPostalCode(updateDTO.getPostalCode().trim());
            }
            if (updateDTO.getCounty() != null) {
                address.setCounty(updateDTO.getCounty().trim());
            }
            if (updateDTO.getType() != null) {
                address.setType(updateDTO.getType());
            }
            
            addressRepository.save(address);
        }
        
        // 5. Update PatientAddress fields
        if (updateDTO.getPhone() != null) {
            patientAddress.setPhone(updateDTO.getPhone().trim());
        }
        if (updateDTO.getEmail() != null) {
            patientAddress.setEmail(updateDTO.getEmail().trim().isEmpty() ? null : updateDTO.getEmail().trim());
        }
        if (updateDTO.getIsMain() != null) {
            // If setting as main, unset other main addresses BEFORE updating this one
            if (Boolean.TRUE.equals(updateDTO.getIsMain())) {
                // Query directly from repository to get current main addresses from database
                List<PatientAddress> mainAddresses = patientAddressRepository.findMainAddressesByPatientId(patientId);
                List<PatientAddress> addressesToUpdate = mainAddresses.stream()
                        .filter(pa -> !pa.getId().equals(addressId))
                        .peek(pa -> pa.setIsMain(false))
                        .collect(Collectors.toList());
                if (!addressesToUpdate.isEmpty()) {
                    patientAddressRepository.saveAll(addressesToUpdate); // Batch update
                    patientAddressRepository.flush(); // Force immediate execution to database
                }
            }
            patientAddress.setIsMain(updateDTO.getIsMain());
        }
        
        // 6. Save PatientAddress
        try {
            patientAddressRepository.save(patientAddress);
            log.info("Successfully updated address ID: {} for patient ID: {}", addressId, patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while updating address for patient {}: {}", 
                    patientId, ex.getMessage());
            throw new ConflictException("Failed to update address due to constraint violation.");
        }
        
        // 7. Return updated patient personal information
        return getPatientPersonal(patientId);
    }

    @Override
    @Transactional
    public PatientPersonalDTO createPatientContact(UUID patientId, UpdatePatientContactDTO updateDTO) {
        log.info("Creating contact for patient ID: {}", patientId);
        
        // 1. Validate required fields for creation
        if (updateDTO.getRelation() == null || updateDTO.getRelation().trim().isEmpty()) {
            throw new IllegalArgumentException("Relation is required");
        }
        if (updateDTO.getName() == null || updateDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Name is required");
        }
        if (updateDTO.getPhone() == null || updateDTO.getPhone().trim().isEmpty()) {
            throw new IllegalArgumentException("Phone is required");
        }
        
        // 2. Verify patient exists and create reference
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }
        
        // 3. If isPrimary is true, unset other primary contacts for this patient BEFORE creating new one
        if (Boolean.TRUE.equals(updateDTO.getIsPrimary())) {
            // Query directly from repository to get current primary contacts from database
            List<PatientContact> primaryContacts = patientContactRepository.findPrimaryContactsByPatientId(patientId);
            if (!primaryContacts.isEmpty()) {
                primaryContacts.forEach(c -> c.setIsPrimary(false));
                patientContactRepository.saveAll(primaryContacts); // Batch update
                patientContactRepository.flush(); // Force immediate execution to database
            }
        }
        
        // 4. Create PatientContact entity
        PatientContact contact = new PatientContact();
        contact.setPatient(patientRepository.getReferenceById(patientId)); // Use reference instead of loading entire entity
        contact.setRelation(updateDTO.getRelation().trim());
        contact.setName(updateDTO.getName().trim());
        contact.setPhone(updateDTO.getPhone().trim());
        contact.setEmail(updateDTO.getEmail() != null && !updateDTO.getEmail().trim().isEmpty() 
                ? updateDTO.getEmail().trim() : null);
        contact.setIsPrimary(updateDTO.getIsPrimary() != null ? updateDTO.getIsPrimary() : false);
        
        // 5. Save PatientContact
        try {
            patientContactRepository.save(contact);
            log.info("Successfully created contact for patient ID: {}", patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while creating contact for patient {}: {}", 
                    patientId, ex.getMessage());
            throw new ConflictException("Failed to create contact due to constraint violation.");
        }
        
        // 6. Return updated patient personal information
        return getPatientPersonal(patientId);
    }

    @Override
    @Transactional
    public PatientPersonalDTO updatePatientContact(UUID patientId, UUID contactId, UpdatePatientContactDTO updateDTO) {
        log.info("Updating contact ID: {} for patient ID: {}", contactId, patientId);
        
        // 1. Find PatientContact
        PatientContact contact = patientContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("PatientContact", contactId));
        
        // 2. Verify that this contact belongs to this patient
        if (!contact.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Contact does not belong to this patient");
        }
        
        // 4. Update contact fields
        if (updateDTO.getRelation() != null) {
            contact.setRelation(updateDTO.getRelation().trim());
        }
        if (updateDTO.getName() != null) {
            contact.setName(updateDTO.getName().trim());
        }
        if (updateDTO.getPhone() != null) {
            contact.setPhone(updateDTO.getPhone().trim());
        }
        if (updateDTO.getEmail() != null) {
            contact.setEmail(updateDTO.getEmail().trim().isEmpty() ? null : updateDTO.getEmail().trim());
        }
        if (updateDTO.getIsPrimary() != null) {
            // If setting as primary, unset other primary contacts BEFORE updating this one
            if (Boolean.TRUE.equals(updateDTO.getIsPrimary())) {
                // Query directly from repository to get current primary contacts from database
                List<PatientContact> primaryContacts = patientContactRepository.findPrimaryContactsByPatientId(patientId);
                List<PatientContact> contactsToUpdate = primaryContacts.stream()
                        .filter(c -> !c.getId().equals(contactId))
                        .peek(c -> c.setIsPrimary(false))
                        .collect(Collectors.toList());
                if (!contactsToUpdate.isEmpty()) {
                    patientContactRepository.saveAll(contactsToUpdate); // Batch update
                    patientContactRepository.flush(); // Force immediate execution to database
                }
            }
            contact.setIsPrimary(updateDTO.getIsPrimary());
        }
        
        // 5. Save PatientContact
        try {
            patientContactRepository.save(contact);
            log.info("Successfully updated contact ID: {} for patient ID: {}", contactId, patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while updating contact for patient {}: {}", 
                    patientId, ex.getMessage());
            throw new ConflictException("Failed to update contact due to constraint violation.");
        }
        
        // 6. Return updated patient personal information
        return getPatientPersonal(patientId);
    }

    @Override
    @Transactional
    public PatientPersonalDTO deletePatientAddress(UUID patientId, UUID addressId) {
        log.info("Deleting address ID: {} for patient ID: {}", addressId, patientId);
        
        // 1. Find PatientAddress
        PatientAddress patientAddress = patientAddressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("PatientAddress", addressId));
        
        // 2. Verify that this address belongs to this patient
        if (!patientAddress.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Address does not belong to this patient");
        }
        
        // 3. Save isMain flag before deletion for auto-promotion logic
        Boolean wasMain = patientAddress.getIsMain();
        Address addressToDelete = patientAddress.getAddress();
        
        // 4. Delete PatientAddress (cascade will not delete Address since no cascade is configured)
        patientAddressRepository.delete(patientAddress);
        
        // 5. Delete Address entity (hard delete)
        if (addressToDelete != null) {
            addressRepository.delete(addressToDelete);
            log.debug("Deleted Address entity with ID: {}", addressToDelete.getId());
        }
        
        // 6. Auto-promote first remaining address as main if deleted address was main
        if (Boolean.TRUE.equals(wasMain)) {
            List<PatientAddress> remainingAddresses = patientAddressRepository.findAllByPatientIdOrderByCreatedAtAsc(patientId);
            if (!remainingAddresses.isEmpty()) {
                PatientAddress firstAddress = remainingAddresses.get(0);
                firstAddress.setIsMain(true);
                patientAddressRepository.save(firstAddress);
                log.info("Auto-promoted address ID: {} as main for patient ID: {}", firstAddress.getId(), patientId);
            }
        }
        
        log.info("Successfully deleted address ID: {} for patient ID: {}", addressId, patientId);
        
        // 7. Return updated patient personal information
        return getPatientPersonal(patientId);
    }

    @Override
    @Transactional
    public PatientPersonalDTO deletePatientContact(UUID patientId, UUID contactId) {
        log.info("Deleting contact ID: {} for patient ID: {}", contactId, patientId);
        
        // 1. Find PatientContact
        PatientContact contact = patientContactRepository.findById(contactId)
                .orElseThrow(() -> new ResourceNotFoundException("PatientContact", contactId));
        
        // 2. Verify that this contact belongs to this patient
        if (!contact.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Contact does not belong to this patient");
        }
        
        // 3. Save isPrimary flag before deletion for auto-promotion logic
        Boolean wasPrimary = contact.getIsPrimary();
        
        // 4. Delete PatientContact
        patientContactRepository.delete(contact);
        
        // 5. Auto-promote first remaining contact as primary if deleted contact was primary
        if (Boolean.TRUE.equals(wasPrimary)) {
            List<PatientContact> remainingContacts = patientContactRepository.findAllByPatientIdOrderByCreatedAtAsc(patientId);
            if (!remainingContacts.isEmpty()) {
                PatientContact firstContact = remainingContacts.get(0);
                firstContact.setIsPrimary(true);
                patientContactRepository.save(firstContact);
                log.info("Auto-promoted contact ID: {} as primary for patient ID: {}", firstContact.getId(), patientId);
            }
        }
        
        log.info("Successfully deleted contact ID: {} for patient ID: {}", contactId, patientId);
        
        // 6. Return updated patient personal information
        return getPatientPersonal(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientProgramDTO getPatientProgram(UUID patientId) {
        // Ensure patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        PatientProgramDTO dto = new PatientProgramDTO();

        // Program (single record per patient)
        List<ProgramDetailDTO> programDetails = patientProgramRepository
            .findByPatientId(patientId)
            .map(pp -> {
                ProgramDetailDTO p = new ProgramDetailDTO();
                p.setProgramIdentifier(pp.getProgram() != null ? pp.getProgram().getProgramIdentifier() : null);
                p.setSupervisorName(pp.getSupervisor() != null
                        ? (pp.getSupervisor().getFirstName() != null && pp.getSupervisor().getLastName() != null
                            ? pp.getSupervisor().getFirstName() + " " + pp.getSupervisor().getLastName()
                            : null)
                        : null);
                p.setEnrollmentDate(pp.getEnrollmentDate());
                p.setEocDate(pp.getEocDate());
                p.setCreatedAt(pp.getCreatedAt());
                p.setStatusEffectiveDate(pp.getStatusEffectiveDate());
                p.setSocDate(pp.getSocDate());
                p.setEligibilityBeginDate(pp.getEligibilityBeginDate());
                p.setEligibilityEndDate(pp.getEligibilityEndDate());
                p.setReasonForChange(pp.getReasonForChange());
                return p;
            })
            .map(java.util.Collections::singletonList)
            .orElse(java.util.Collections.emptyList());
        dto.setProgram(programDetails);

        // Payers
        List<PayerDetailDTO> payerDetails = patientPayerRepository
            .findAllByPatientIdOrderByStartDateAsc(patientId)
            .stream()
            .map(pp -> {
                PayerDetailDTO p = new PayerDetailDTO();
                p.setPatientPayerId(pp.getId());
                p.setPayerName(pp.getPayer() != null ? pp.getPayer().getPayerName() : null);
                p.setPayerIdentifier(pp.getPayer() != null ? pp.getPayer().getPayerIdentifier() : null);
                p.setRank(pp.getRank());
                p.setClientPayerId(pp.getClientPayerId());
                p.setStartDate(pp.getStartDate());
                p.setGroupNo(pp.getGroupNo());
                p.setEndDate(pp.getEndDate());
                return p;
            })
            .collect(java.util.stream.Collectors.toList());
        dto.setPayer(payerDetails);

        // Services
        List<ServiceDetailDTO> serviceDetails = patientServiceRepository
            .findAllByPatientIdOrderByStartDateDesc(patientId)
            .stream()
            .map(ps -> {
                ServiceDetailDTO s = new ServiceDetailDTO();
                s.setPatientServiceId(ps.getId());
                s.setServiceName(ps.getServiceType() != null ? ps.getServiceType().getName() : null);
                s.setServiceCode(ps.getServiceType() != null ? ps.getServiceType().getCode() : null);
                s.setStartDate(ps.getStartDate());
                s.setEndDate(ps.getEndDate());
                return s;
            })
            .collect(java.util.stream.Collectors.toList());
        dto.setServices(serviceDetails);

        // Authorizations
        List<AuthorizationDTO> authorizationDetails = authorizationRepository
            .findAllByPatientIdOrderByStartDateDesc(patientId)
            .stream()
            .map(a -> {
                AuthorizationDTO ad = new AuthorizationDTO();
                ad.setAuthorizationId(a.getId());
                ad.setPayerIdentifier(a.getPatientPayer() != null && a.getPatientPayer().getPayer() != null
                        ? a.getPatientPayer().getPayer().getPayerIdentifier()
                        : null);
                ad.setServiceCode(a.getPatientService() != null && a.getPatientService().getServiceType() != null
                        ? a.getPatientService().getServiceType().getCode()
                        : null);
                ad.setAuthorizationNo(a.getAuthorizationNo());
                ad.setEventCode(a.getEventCode());
                ad.setModifiers(a.getModifiers());
                ad.setFormat(a.getFormat());
                ad.setStartDate(a.getStartDate());
                ad.setEndDate(a.getEndDate());
                ad.setComments(a.getComments());
                ad.setMaxUnits(a.getMaxUnits());
                ad.setTotalUsed(a.getTotalUsed());
                ad.setTotalMissed(a.getTotalMissed());
                ad.setTotalRemaining(a.getTotalRemaining());
                ad.setMeta(a.getMeta());
                return ad;
            })
            .collect(java.util.stream.Collectors.toList());
        dto.setAuthorizations(authorizationDetails);

        return dto;
    }

    @Override
    @Transactional
    public PatientProgramDTO updatePatientProgram(UUID patientId, UpdatePatientProgramDTO updateDTO) {
        log.info("Updating program for patient ID: {}", patientId);

        // Validate patient exists
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        // Validate program exists
        Program program = programRepository.findById(updateDTO.getProgramId())
            .orElseThrow(() -> new ResourceNotFoundException("Program", updateDTO.getProgramId()));

        // Validate supervisor if provided
        Staff supervisor = null;
        if (updateDTO.getSupervisorId() != null) {
            supervisor = staffRepository.findById(updateDTO.getSupervisorId())
                .orElseThrow(() -> new ResourceNotFoundException("Supervisor", updateDTO.getSupervisorId()));
        }

        // Find existing PatientProgram or create new
        PatientProgram patientProgram = patientProgramRepository.findByPatientId(patientId)
            .orElseGet(() -> {
                PatientProgram newPp = new PatientProgram();
                newPp.setPatient(patient);
                return newPp;
            });

        // Update fields
        patientProgram.setProgram(program);
        patientProgram.setSupervisor(supervisor);
        
        if (updateDTO.getEnrollmentDate() != null) {
            patientProgram.setEnrollmentDate(updateDTO.getEnrollmentDate());
        }
        
        patientProgram.setStatusEffectiveDate(updateDTO.getStatusEffectiveDate());
        
        if (updateDTO.getSocDate() != null) {
            patientProgram.setSocDate(updateDTO.getSocDate());
        }
        
        if (updateDTO.getEocDate() != null) {
            patientProgram.setEocDate(updateDTO.getEocDate());
        }
        
        if (updateDTO.getEligibilityBeginDate() != null) {
            patientProgram.setEligibilityBeginDate(updateDTO.getEligibilityBeginDate());
        }
        
        if (updateDTO.getEligibilityEndDate() != null) {
            patientProgram.setEligibilityEndDate(updateDTO.getEligibilityEndDate());
        }
        
        if (updateDTO.getReasonForChange() != null && !updateDTO.getReasonForChange().isBlank()) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/dd/yyyy");
            String entry = updateDTO.getReasonForChange().trim() + " - " + LocalDate.now().format(fmt);
        
            List<String> reasons = patientProgram.getReasonForChange();
            if (reasons == null) {
                reasons = new ArrayList<>();
            }
            reasons.add(entry);
            patientProgram.setReasonForChange(reasons);
        }

        // Save
        patientProgramRepository.save(patientProgram);

        log.info("Successfully updated program for patient ID: {}", patientId);

        // Return updated program data using existing method
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional
    public PatientProgramDTO createPatientService(UUID patientId, CreatePatientServiceDTO createDTO) {
        log.info("Creating service for patient ID: {}", patientId);

        // Validate patient exists
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        // Validate service type exists
        com.example.backend.model.entity.ServiceType serviceType = serviceTypeRepository.findById(createDTO.getServiceTypeId())
            .orElseThrow(() -> new ResourceNotFoundException("Service Type", createDTO.getServiceTypeId()));

        // Validate dates
        if (createDTO.getEndDate() != null && 
            createDTO.getStartDate().isAfter(createDTO.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Create new patient service
        com.example.backend.model.entity.PatientService patientService = new com.example.backend.model.entity.PatientService();
        patientService.setPatient(patient);
        patientService.setServiceType(serviceType);
        patientService.setStartDate(createDTO.getStartDate());
        patientService.setEndDate(createDTO.getEndDate());

        // Save
        patientServiceRepository.save(patientService);

        log.info("Successfully created service for patient ID: {}", patientId);

        // Return updated program data
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional
    public PatientProgramDTO updatePatientService(UUID patientId, UUID patientServiceId, UpdatePatientServiceDTO updateDTO) {
        log.info("Updating service ID: {} for patient ID: {}", patientServiceId, patientId);

        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        // Find patient service and validate it belongs to patient
        com.example.backend.model.entity.PatientService patientService = patientServiceRepository.findById(patientServiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient Service", patientServiceId));

        if (!patientService.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Service does not belong to the specified patient");
        }

        // Update service type if provided
        if (updateDTO.getServiceTypeId() != null) {
            com.example.backend.model.entity.ServiceType serviceType = serviceTypeRepository.findById(updateDTO.getServiceTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Service Type", updateDTO.getServiceTypeId()));
            patientService.setServiceType(serviceType);
        }

        // Update dates if provided
        if (updateDTO.getStartDate() != null) {
            patientService.setStartDate(updateDTO.getStartDate());
        }
        
        if (updateDTO.getEndDate() != null) {
            patientService.setEndDate(updateDTO.getEndDate());
        }

        // Validate dates after update
        if (patientService.getStartDate() != null && patientService.getEndDate() != null &&
            patientService.getStartDate().isAfter(patientService.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Save
        patientServiceRepository.save(patientService);

        log.info("Successfully updated service ID: {} for patient ID: {}", patientServiceId, patientId);

        // Return updated program data
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional
    public PatientProgramDTO deletePatientService(UUID patientId, UUID patientServiceId) {
        log.info("Deleting service ID: {} for patient ID: {}", patientServiceId, patientId);

        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        // Find patient service and validate it belongs to patient
        com.example.backend.model.entity.PatientService patientService = patientServiceRepository.findById(patientServiceId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient Service", patientServiceId));

        if (authorizationRepository.existsByPatientServiceId(patientServiceId)) {
            throw new ConflictException("Service is associated with an authorization and cannot be deleted");
        }

        // Delete
        patientServiceRepository.delete(patientService);

        log.info("Successfully deleted service ID: {} for patient ID: {}", patientServiceId, patientId);

        // Return updated program data
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayerAuthorizationDTO> getPatientPayerAuthorizations(UUID patientId, UUID patientPayerId) {
        log.info("Getting authorizations for patient payer ID: {} of patient ID: {}", patientPayerId, patientId);

        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        // Find patient payer and validate it belongs to patient
        PatientPayer patientPayer = patientPayerRepository.findById(patientPayerId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient Payer", patientPayerId));

        if (!patientPayer.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Patient payer does not belong to the specified patient");
        }

        // Fetch authorizations
        List<com.example.backend.model.entity.Authorization> authorizations = 
            authorizationRepository.findAllByPatientPayerIdOrderByStartDateDesc(patientPayerId);

        // Map to DTO
        List<PayerAuthorizationDTO> result = authorizations.stream()
            .map(auth -> {
                PayerAuthorizationDTO dto = new PayerAuthorizationDTO();
                dto.setServiceCode(auth.getPatientService() != null && auth.getPatientService().getServiceType() != null
                    ? auth.getPatientService().getServiceType().getCode()
                    : null);
                dto.setAuthorizationNo(auth.getAuthorizationNo());
                dto.setFormat(auth.getFormat());
                dto.setMaxUnits(auth.getMaxUnits());
                dto.setStartDate(auth.getStartDate());
                dto.setEndDate(auth.getEndDate());
                return dto;
            })
            .collect(Collectors.toList());

        log.info("Found {} authorizations for patient payer ID: {}", result.size(), patientPayerId);
        return result;
    }

    @Override
    @Transactional
    public PatientProgramDTO createPatientPayer(UUID patientId, CreatePatientPayerDTO createDTO) {
        log.info("Creating payer for patient ID: {}", patientId);

        // Validate patient exists
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        // Validate payer exists and is active
        Payer payer = payerRepository.findById(createDTO.getPayerId())
            .orElseThrow(() -> new ResourceNotFoundException("Payer", createDTO.getPayerId()));

        if (!payer.isActivePayer()) {
            throw new IllegalArgumentException("Payer '" + payer.getPayerName() + "' is not active");
        }

        // Validate dates
        if (createDTO.getEndDate() != null && createDTO.getStartDate() != null &&
            createDTO.getStartDate().isAfter(createDTO.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Create new patient payer
        PatientPayer patientPayer = new PatientPayer();
        patientPayer.setPatient(patient);
        patientPayer.setPayer(payer);
        patientPayer.setClientPayerId(patient.getMedicaidId()); // Set from patient's medicaid ID
        patientPayer.setRank(createDTO.getRank());
        patientPayer.setGroupNo(createDTO.getGroupNo());
        patientPayer.setStartDate(createDTO.getStartDate());
        patientPayer.setEndDate(createDTO.getEndDate());

        // Save (DB will enforce unique constraint on patient_id + payer_id)
        try {
            patientPayerRepository.save(patientPayer);
            log.info("Successfully created payer for patient ID: {}", patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while creating payer for patient {}: {}", patientId, ex.getMessage());
            throw new ConflictException("Patient already has this payer assigned");
        }

        // Return updated program data
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional
    public PatientProgramDTO updatePatientPayer(UUID patientId, UUID patientPayerId, UpdatePatientPayerDTO updateDTO) {
        log.info("Updating payer ID: {} for patient ID: {}", patientPayerId, patientId);

        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        // Find patient payer and validate it belongs to patient
        PatientPayer patientPayer = patientPayerRepository.findById(patientPayerId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient Payer", patientPayerId));

        if (!patientPayer.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Patient payer does not belong to the specified patient");
        }

        // Update payer if provided
        if (updateDTO.getPayerId() != null) {
            Payer payer = payerRepository.findById(updateDTO.getPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Payer", updateDTO.getPayerId()));
            
            if (!payer.isActivePayer()) {
                throw new IllegalArgumentException("Payer '" + payer.getPayerName() + "' is not active");
            }
            
            patientPayer.setPayer(payer);
        }

        // Update other fields if provided
        if (updateDTO.getRank() != null) {
            patientPayer.setRank(updateDTO.getRank());
        }
        
        if (updateDTO.getGroupNo() != null) {
            patientPayer.setGroupNo(updateDTO.getGroupNo());
        }

        if (updateDTO.getStartDate() != null) {
            patientPayer.setStartDate(updateDTO.getStartDate());
        }
        
        if (updateDTO.getEndDate() != null) {
            patientPayer.setEndDate(updateDTO.getEndDate());
        }

        // Validate dates after update
        if (patientPayer.getStartDate() != null && patientPayer.getEndDate() != null &&
            patientPayer.getStartDate().isAfter(patientPayer.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Save
        try {
            patientPayerRepository.save(patientPayer);
            log.info("Successfully updated payer ID: {} for patient ID: {}", patientPayerId, patientId);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while updating payer for patient {}: {}", patientId, ex.getMessage());
            throw new ConflictException("Patient already has this payer assigned");
        }

        // Return updated program data
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional
    public PatientProgramDTO createAuthorization(UUID patientId, CreateAuthorizationDTO createDTO) {
        log.info("Creating authorization for patient ID: {}", patientId);

        // Validate patient exists
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient", patientId));

        // Validate patient service exists and belongs to patient
        com.example.backend.model.entity.PatientService patientService = patientServiceRepository.findById(createDTO.getPatientServiceId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient Service", createDTO.getPatientServiceId()));

        if (!patientService.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Patient service does not belong to the specified patient");
        }

        // Validate patient payer exists and belongs to patient
        PatientPayer patientPayer = patientPayerRepository.findById(createDTO.getPatientPayerId())
            .orElseThrow(() -> new ResourceNotFoundException("Patient Payer", createDTO.getPatientPayerId()));

        if (!patientPayer.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Patient payer does not belong to the specified patient");
        }

        // Check authorization number uniqueness
        if (authorizationRepository.findByAuthorizationNo(createDTO.getAuthorizationNo()).isPresent()) {
            throw new ConflictException("Authorization number '" + createDTO.getAuthorizationNo() + "' already exists");
        }

        // Validate dates
        if (createDTO.getEndDate() != null && createDTO.getStartDate().isAfter(createDTO.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Create new authorization
        com.example.backend.model.entity.Authorization authorization = new com.example.backend.model.entity.Authorization();
        authorization.setPatient(patient);
        authorization.setPatientService(patientService);
        authorization.setPatientPayer(patientPayer);
        authorization.setAuthorizationNo(createDTO.getAuthorizationNo());
        authorization.setEventCode(createDTO.getEventCode());
        authorization.setFormat(createDTO.getFormat() != null ? createDTO.getFormat() : "units");
        authorization.setMaxUnits(createDTO.getMaxUnits());
        authorization.setStartDate(createDTO.getStartDate());
        authorization.setEndDate(createDTO.getEndDate());
        authorization.setComments(createDTO.getComments());

        // Save
        authorizationRepository.save(authorization);

        log.info("Successfully created authorization for patient ID: {}", patientId);

        // Return updated program data
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional
    public PatientProgramDTO updateAuthorization(UUID patientId, UUID authorizationId, UpdateAuthorizationDTO updateDTO) {
        log.info("Updating authorization ID: {} for patient ID: {}", authorizationId, patientId);

        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        // Find authorization and validate it belongs to patient
        com.example.backend.model.entity.Authorization authorization = authorizationRepository.findById(authorizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Authorization", authorizationId));

        if (!authorization.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Authorization does not belong to the specified patient");
        }

        // Update patient service if provided
        if (updateDTO.getPatientServiceId() != null) {
            com.example.backend.model.entity.PatientService patientService = patientServiceRepository.findById(updateDTO.getPatientServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient Service", updateDTO.getPatientServiceId()));

            if (!patientService.getPatient().getId().equals(patientId)) {
                throw new IllegalArgumentException("Patient service does not belong to the specified patient");
            }

            authorization.setPatientService(patientService);
        }

        // Update patient payer if provided
        if (updateDTO.getPatientPayerId() != null) {
            PatientPayer patientPayer = patientPayerRepository.findById(updateDTO.getPatientPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient Payer", updateDTO.getPatientPayerId()));

            if (!patientPayer.getPatient().getId().equals(patientId)) {
                throw new IllegalArgumentException("Patient payer does not belong to the specified patient");
            }

            authorization.setPatientPayer(patientPayer);
        }

        // Update authorization number if provided and check uniqueness
        if (updateDTO.getAuthorizationNo() != null) {
            if (!authorization.getAuthorizationNo().equals(updateDTO.getAuthorizationNo())) {
                // Check if new authorization number already exists
                authorizationRepository.findByAuthorizationNo(updateDTO.getAuthorizationNo())
                    .ifPresent(existingAuth -> {
                        if (!existingAuth.getId().equals(authorizationId)) {
                            throw new ConflictException("Authorization number '" + updateDTO.getAuthorizationNo() + "' already exists");
                        }
                    });
            }
            authorization.setAuthorizationNo(updateDTO.getAuthorizationNo());
        }

        // Update other fields if provided
        if (updateDTO.getEventCode() != null) {
            authorization.setEventCode(updateDTO.getEventCode());
        }

        if (updateDTO.getFormat() != null) {
            authorization.setFormat(updateDTO.getFormat());
        }

        if (updateDTO.getMaxUnits() != null) {
            authorization.setMaxUnits(updateDTO.getMaxUnits());
        }

        if (updateDTO.getStartDate() != null) {
            authorization.setStartDate(updateDTO.getStartDate());
        }

        if (updateDTO.getEndDate() != null) {
            authorization.setEndDate(updateDTO.getEndDate());
        }

        if (updateDTO.getComments() != null) {
            authorization.setComments(updateDTO.getComments());
        }

        // Validate dates after update
        if (authorization.getStartDate() != null && authorization.getEndDate() != null &&
            authorization.getStartDate().isAfter(authorization.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Save
        authorizationRepository.save(authorization);

        log.info("Successfully updated authorization ID: {} for patient ID: {}", authorizationId, patientId);

        // Return updated program data
        return getPatientProgram(patientId);
    }

    @Override
    @Transactional
    public PatientProgramDTO deleteAuthorization(UUID patientId, UUID authorizationId) {
        log.info("Deleting authorization ID: {} for patient ID: {}", authorizationId, patientId);

        // Validate patient exists
        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException("Patient", patientId);
        }

        // Find authorization and validate it belongs to patient
        com.example.backend.model.entity.Authorization authorization = authorizationRepository.findById(authorizationId)
            .orElseThrow(() -> new ResourceNotFoundException("Authorization", authorizationId));

        if (!authorization.getPatient().getId().equals(patientId)) {
            throw new IllegalArgumentException("Authorization does not belong to the specified patient");
        }

        // Delete
        authorizationRepository.delete(authorization);

        log.info("Successfully deleted authorization ID: {} for patient ID: {}", authorizationId, patientId);

        // Return updated program data
        return getPatientProgram(patientId);
    }
}
