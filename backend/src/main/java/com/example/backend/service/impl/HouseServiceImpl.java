package com.example.backend.service.impl;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.dto.*;
import com.example.backend.model.entity.*;
import com.example.backend.model.enums.CareSetting;
import com.example.backend.repository.*;
import com.example.backend.service.HouseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HouseServiceImpl implements HouseService {

    private final HouseRepository houseRepository;
    private final PatientHouseStayRepository patientHouseStayRepository;
    private final OfficeRepository officeRepository;
    private final AddressRepository addressRepository;
    private final PatientRepository patientRepository;
    private final AuthorizationRepository authorizationRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<HouseDTO> getAllHouses(Pageable pageable, UUID officeId, String search) {
        log.info("Fetching houses with filters - officeId: {}, search: {}", officeId, search);
        Page<House> houses = houseRepository.findAllWithFilters(officeId, search, pageable);
        return houses.map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public HouseDTO getHouseById(UUID id) {
        log.info("Fetching house by ID: {}", id);
        House house = houseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("House", id));
        return convertToDTO(house);
    }

    @Override
    @Transactional
    public HouseDTO createHouse(HouseCreateRequest request) {
        log.info("Creating new house with code: {}", request.getCode());

        // Validate office exists
        Office office = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> new ResourceNotFoundException("Office", request.getOfficeId()));

        // Check if code already exists for this office
        if (houseRepository.existsByCodeAndOfficeId(request.getCode(), request.getOfficeId())) {
            throw new ConflictException("House code already exists for this office: " + request.getCode());
        }

        House house = new House();
        house.setOffice(office);
        house.setCode(request.getCode());
        house.setName(request.getName());
        house.setDescription(request.getDescription());
        house.setIsActive(true);

        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address", request.getAddressId()));
            house.setAddress(address);
        }

        house = houseRepository.save(house);
        log.info("House created successfully with ID: {}", house.getId());
        return convertToDTO(house);
    }

    @Override
    @Transactional
    public HouseDTO updateHouse(UUID id, HouseUpdateRequest request) {
        log.info("Updating house with ID: {}", id);

        House house = houseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("House", id));

        if (request.getCode() != null) {
            // Check if new code conflicts with existing house in same office
            if (!house.getCode().equals(request.getCode()) &&
                houseRepository.existsByCodeAndOfficeId(request.getCode(), house.getOffice().getId())) {
                throw new ConflictException("House code already exists for this office: " + request.getCode());
            }
            house.setCode(request.getCode());
        }

        if (request.getName() != null) {
            house.setName(request.getName());
        }

        if (request.getDescription() != null) {
            house.setDescription(request.getDescription());
        }

        if (request.getIsActive() != null) {
            house.setIsActive(request.getIsActive());
        }

        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address", request.getAddressId()));
            house.setAddress(address);
        }

        house = houseRepository.save(house);
        log.info("House updated successfully with ID: {}", house.getId());
        return convertToDTO(house);
    }

    @Override
    @Transactional
    public void deleteHouse(UUID id) {
        log.info("Soft deleting house with ID: {}", id);

        House house = houseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("House", id));

        // Check if house has active patient
        if (patientHouseStayRepository.existsByHouseIdAndMoveOutDateIsNull(id)) {
            throw new ValidationException("Cannot delete house with active patient. Please unassign patient first.");
        }

        house.markAsDeleted();
        houseRepository.save(house);
        log.info("House soft deleted successfully with ID: {}", id);
    }

    @Override
    @Transactional
    public PatientHouseStayDTO assignPatientToHouse(UUID houseId, AssignPatientRequest request) {
        log.info("Assigning patient {} to house {}", request.getPatientId(), houseId);

        // Validate house exists
        House house = houseRepository.findById(houseId)
                .orElseThrow(() -> new ResourceNotFoundException("House", houseId));

        // Validate patient exists
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", request.getPatientId()));

        // Validate patient has active authorization with residential care setting
        validatePatientHasResidentialAuthorization(request.getPatientId(), request.getMoveInDate());

        // Check house doesn't already have an active patient
        if (patientHouseStayRepository.existsByHouseIdAndMoveOutDateIsNull(houseId)) {
            throw new ConflictException("House already has an active patient assigned");
        }

        // Check patient is not already assigned to another house
        if (patientHouseStayRepository.existsByPatientIdAndMoveOutDateIsNull(request.getPatientId())) {
            throw new ConflictException("Patient is already assigned to another house");
        }

        // Validate move in date
        if (request.getMoveInDate().isAfter(LocalDate.now())) {
            throw new ValidationException("Move in date cannot be in the future");
        }

        // Create stay
        PatientHouseStay stay = new PatientHouseStay(patient, house, request.getMoveInDate());
        stay = patientHouseStayRepository.save(stay);

        log.info("Patient {} assigned to house {} successfully", request.getPatientId(), houseId);
        return convertStayToDTO(stay);
    }

    @Override
    @Transactional
    public PatientHouseStayDTO unassignPatientFromHouse(UUID stayId, LocalDate moveOutDate) {
        log.info("Unassigning patient from stay {}", stayId);

        PatientHouseStay stay = patientHouseStayRepository.findById(stayId)
                .orElseThrow(() -> new ResourceNotFoundException("PatientHouseStay", stayId));

        // Validate move out date
        if (moveOutDate.isBefore(stay.getMoveInDate())) {
            throw new ValidationException("Move out date cannot be before move in date");
        }

        if (moveOutDate.isAfter(LocalDate.now())) {
            throw new ValidationException("Move out date cannot be in the future");
        }

        stay.unassign(moveOutDate);
        stay = patientHouseStayRepository.save(stay);

        log.info("Patient unassigned from house successfully");
        return convertStayToDTO(stay);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientHouseStayDTO> getPatientStays(UUID patientId) {
        log.info("Fetching stays for patient: {}", patientId);
        List<PatientHouseStay> stays = patientHouseStayRepository.findByPatientIdOrderByMoveInDateDesc(patientId);
        return stays.stream()
                .map(this::convertStayToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientHouseStayDTO getHouseCurrentPatient(UUID houseId) {
        log.info("Fetching current patient for house: {}", houseId);
        return patientHouseStayRepository.findByHouseIdAndMoveOutDateIsNull(houseId)
                .map(this::convertStayToDTO)
                .orElse(null);
    }

    /**
     * Validate that patient has an active authorization with residential care setting
     */
    private void validatePatientHasResidentialAuthorization(UUID patientId, LocalDate checkDate) {
        log.debug("Validating residential authorization for patient: {} on date: {}", patientId, checkDate);

        // Get all authorizations for patient
        List<Authorization> authorizations = authorizationRepository.findAllByPatientIdOrderByStartDateDesc(patientId);

        // Filter for active residential authorizations
        boolean hasValidResidentialAuth = authorizations.stream()
                .anyMatch(auth -> {
                    // Check authorization is active on check date
                    boolean isActive = auth.getStartDate().isBefore(checkDate) || auth.getStartDate().equals(checkDate);
                    if (auth.getEndDate() != null) {
                        isActive = isActive && (auth.getEndDate().isAfter(checkDate) || auth.getEndDate().equals(checkDate));
                    }

                    if (!isActive) {
                        return false;
                    }

                    // Check service type has residential care setting
                    PatientService patientService = auth.getPatientService();
                    if (patientService == null) {
                        return false;
                    }

                    ServiceType serviceType = patientService.getServiceType();
                    if (serviceType == null) {
                        return false;
                    }

                    return CareSetting.RESIDENTIAL.equals(serviceType.getCareSetting());
                });

        if (!hasValidResidentialAuth) {
            throw new ValidationException(
                "Patient does not have an active authorization with residential care setting. " +
                "Please ensure the patient has an active authorization for a residential service type."
            );
        }
    }

    /**
     * Convert House entity to DTO
     */
    private HouseDTO convertToDTO(House house) {
        HouseDTO.HouseDTOBuilder builder = HouseDTO.builder()
                .id(house.getId())
                .officeId(house.getOffice().getId())
                .officeName(house.getOffice().getName())
                .code(house.getCode())
                .name(house.getName())
                .description(house.getDescription())
                .isActive(house.getIsActive());

        // Add address information if available
        if (house.getAddress() != null) {
            Address addr = house.getAddress();
            builder.addressId(addr.getId())
                    .addressLine1(addr.getLine1())
                    .addressLine2(addr.getLine2())
                    .city(addr.getCity())
                    .state(addr.getState())
                    .zipCode(addr.getPostalCode())
                    .fullAddress(addr.getFullAddress());
        }

        // Add current patient information if available
        patientHouseStayRepository.findByHouseIdAndMoveOutDateIsNull(house.getId())
                .ifPresent(stay -> {
                    Patient patient = stay.getPatient();
                    builder.currentPatientId(patient.getId())
                            .currentPatientName(patient.getFirstName() + " " + patient.getLastName())
                            .currentStayId(stay.getId());
                });

        return builder.build();
    }

    /**
     * Convert PatientHouseStay entity to DTO
     */
    private PatientHouseStayDTO convertStayToDTO(PatientHouseStay stay) {
        Patient patient = stay.getPatient();
        House house = stay.getHouse();

        return PatientHouseStayDTO.builder()
                .id(stay.getId())
                .patientId(patient.getId())
                .patientName(patient.getFirstName() + " " + patient.getLastName())
                .houseId(house.getId())
                .houseName(house.getName())
                .houseCode(house.getCode())
                .moveInDate(stay.getMoveInDate())
                .moveOutDate(stay.getMoveOutDate())
                .isActive(stay.isActive())
                .build();
    }
}





