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
import com.example.backend.model.entity.Patient;
import com.example.backend.model.enums.Gender;
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.PayerRepository;
import com.example.backend.repository.ProgramRepository;
import org.springframework.dao.DataIntegrityViolationException;
import com.example.backend.repository.PatientProgramRepository;
import com.example.backend.repository.PatientPayerRepository;
import com.example.backend.repository.PatientAddressRepository;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.PatientAddress;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Payer;
import com.example.backend.model.entity.Program;
import com.example.backend.model.entity.UserOffice;
import com.example.backend.model.entity.PatientProgram;
import com.example.backend.model.entity.PatientPayer;
import com.example.backend.model.enums.PatientStatus;
import com.example.backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final ProgramRepository programRepository;
    private final PayerRepository payerRepository;
    private final OfficeRepository officeRepository;
    private final AppUserRepository appUserRepository;
    private final PatientProgramRepository patientProgramRepository;
    private final PatientPayerRepository patientPayerRepository;
    private final PatientAddressRepository patientAddressRepository;
    
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
        
        // Map contacts
        List<ContactDTO> contacts = patient.getContacts().stream()
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
        
        // Map addresses
        List<AddressDTO> addresses = patient.getPatientAddresses().stream()
            .map(patientAddress -> {
                AddressDTO addressDTO = new AddressDTO();
                addressDTO.setId(patientAddress.getId());
                if (patientAddress.getAddress() != null) {
                    addressDTO.setLine1(patientAddress.getAddress().getLine1());
                    addressDTO.setLine2(patientAddress.getAddress().getLine2());
                    addressDTO.setCity(patientAddress.getAddress().getCity());
                    addressDTO.setState(patientAddress.getAddress().getState());
                    addressDTO.setPostalCode(patientAddress.getAddress().getPostalCode());
                    addressDTO.setCounty(patientAddress.getAddress().getCounty());
                }
                addressDTO.setPhone(patientAddress.getPhone());
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
        patientPayer.setMedicaidId(createPatientDTO.getMedicaidId());
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
}
