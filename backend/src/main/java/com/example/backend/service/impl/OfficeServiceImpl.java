package com.example.backend.service.impl;

import com.example.backend.model.dto.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.dto.OfficeDTO;
import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.Staff;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.OfficeRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.service.OfficeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OfficeServiceImpl implements OfficeService {

    private final OfficeRepository officeRepository;
    private final StaffRepository staffRepository;
    private final PatientRepository patientRepository;
    private final AddressRepository addressRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OfficeDTO> getActiveOffices() {
        log.info("Fetching all active offices");
        return officeRepository.findByIsActiveTrueAndDeletedAtIsNull().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfficeDTO> getAllOffices() {
        log.info("Fetching all offices (including inactive)");
        return officeRepository.findByDeletedAtIsNull().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OfficeDetailResponse getOfficeById(UUID id) {
        log.info("Fetching office by ID: {}", id);
        Office office = officeRepository.findByIdWithAddress(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with ID: " + id));
        return convertToDetailResponse(office);
    }

    @Transactional(readOnly = true)
    public OfficeDetailResponse getOfficeByCode(String code) {
        log.info("Fetching office by code: {}", code);
        Office office = officeRepository.findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with code: " + code));
        return convertToDetailResponse(office);
    }

    @Transactional
    public OfficeDetailResponse createOffice(OfficeCreateRequest request) {
        log.info("Creating new office with code: {}", request.getCode());

        if (officeRepository.existsByCodeAndDeletedAtIsNull(request.getCode())) {
            throw new ValidationException("Office code already exists: " + request.getCode());
        }

        Office office = new Office();
        office.setCode(request.getCode());
        office.setName(request.getName());
        office.setCounty(request.getCounty());
        office.setPhone(request.getPhone());
        office.setEmail(request.getEmail());
        office.setTimezone(request.getTimezone() != null ? request.getTimezone() : "America/New_York");
        office.setBillingConfig(request.getBillingConfig());
        office.setIsActive(true);

        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + request.getAddressId()));
            office.setAddress(address);
        }

        office = officeRepository.save(office);
        log.info("Office created successfully with ID: {}", office.getId());
        return convertToDetailResponse(office);
    }

    @Transactional
    public OfficeDetailResponse updateOffice(UUID id, OfficeUpdateRequest request) {
        log.info("Updating office with ID: {}", id);

        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with ID: " + id));

        if (request.getName() != null) {
            office.setName(request.getName());
        }
        if (request.getCounty() != null) {
            office.setCounty(request.getCounty());
        }
        if (request.getPhone() != null) {
            office.setPhone(request.getPhone());
        }
        if (request.getEmail() != null) {
            office.setEmail(request.getEmail());
        }
        if (request.getTimezone() != null) {
            office.setTimezone(request.getTimezone());
        }
        if (request.getBillingConfig() != null) {
            office.setBillingConfig(request.getBillingConfig());
        }
        if (request.getIsActive() != null) {
            office.setIsActive(request.getIsActive());
        }

        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + request.getAddressId()));
            office.setAddress(address);
        }

        office = officeRepository.save(office);
        log.info("Office updated successfully with ID: {}", office.getId());
        return convertToDetailResponse(office);
    }

    @Transactional
    public void deleteOffice(UUID id) {
        log.info("Soft deleting office with ID: {}", id);

        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with ID: " + id));

        long activeStaffCount = staffRepository.countActiveByOfficeId(id);
        long activePatientsCount = patientRepository.countActiveByOfficeId(id);

        if (activeStaffCount > 0) {
            throw new ValidationException("Cannot delete office with active staff. Please reassign or deactivate staff first.");
        }
        if (activePatientsCount > 0) {
            throw new ValidationException("Cannot delete office with active patients. Please reassign or deactivate patients first.");
        }

        office.markAsDeleted();
        officeRepository.save(office);
        log.info("Office soft deleted successfully with ID: {}", id);
    }

    @Transactional
    public void activateOffice(UUID id) {
        log.info("Activating office with ID: {}", id);
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with ID: " + id));
        office.setIsActive(true);
        officeRepository.save(office);
        log.info("Office activated successfully with ID: {}", id);
    }

    @Transactional
    public void deactivateOffice(UUID id) {
        log.info("Deactivating office with ID: {}", id);
        Office office = officeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found with ID: " + id));
        office.setIsActive(false);
        officeRepository.save(office);
        log.info("Office deactivated successfully with ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<OfficeStaffDTO> getOfficeStaff(UUID officeId, Boolean activeOnly) {
        log.info("Fetching staff for office ID: {}, activeOnly: {}", officeId, activeOnly);

        if (!officeRepository.existsById(officeId)) {
            throw new ResourceNotFoundException("Office not found with ID: " + officeId);
        }

        List<Staff> staffList = activeOnly != null && activeOnly
                ? staffRepository.findActiveByOfficeId(officeId)
                : staffRepository.findByOfficeId(officeId);

        return staffList.stream()
                .map(this::convertToOfficeStaffDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OfficePatientDTO> getOfficePatients(UUID officeId, Boolean activeOnly) {
        log.info("Fetching patients for office ID: {}, activeOnly: {}", officeId, activeOnly);

        if (!officeRepository.existsById(officeId)) {
            throw new ResourceNotFoundException("Office not found with ID: " + officeId);
        }

        List<Patient> patientList = activeOnly != null && activeOnly
                ? patientRepository.findActiveByOfficeId(officeId)
                : patientRepository.findByOfficeIdAndDeletedAtIsNull(officeId);

        return patientList.stream()
                .map(this::convertToOfficePatientDTO)
                .collect(Collectors.toList());
    }

    private OfficeDTO convertToDTO(Office office) {
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

    private OfficeDetailResponse convertToDetailResponse(Office office) {
        OfficeDetailResponse response = OfficeDetailResponse.builder()
                .id(office.getId())
                .code(office.getCode())
                .name(office.getName())
                .county(office.getCounty())
                .phone(office.getPhone())
                .email(office.getEmail())
                .timezone(office.getTimezone())
                .isActive(office.getIsActive())
                .billingConfig(office.getBillingConfig())
                .createdAt(office.getCreatedAt())
                .updatedAt(office.getUpdatedAt())
                .deletedAt(office.getDeletedAt())
                .build();

        if (office.getAddress() != null) {
            Address addr = office.getAddress();
            response.setAddressId(addr.getId());
            response.setAddressLine1(addr.getLine1());
            response.setAddressLine2(addr.getLine2());
            response.setCity(addr.getCity());
            response.setState(addr.getState());
            response.setZipCode(addr.getPostalCode());
            response.setFullAddress(addr.getFullAddress());
        }

        long totalStaff = staffRepository.countByOfficeId(office.getId());
        long activeStaff = staffRepository.countActiveByOfficeId(office.getId());
        long totalPatients = patientRepository.countByOfficeIdAndDeletedAtIsNull(office.getId());
        long activePatients = patientRepository.countActiveByOfficeId(office.getId());

        response.setTotalStaff((int) totalStaff);
        response.setActiveStaff((int) activeStaff);
        response.setTotalPatients((int) totalPatients);
        response.setActivePatients((int) activePatients);

        return response;
    }

    private OfficeStaffDTO convertToOfficeStaffDTO(Staff staff) {
        String roleName = staff.getUser() != null && staff.getUser().getRole() != null
                ? staff.getUser().getRole().getName()
                : null;

        String email = staff.getStaffAddresses().stream()
                .filter(sa -> sa.getIsMain() != null && sa.getIsMain())
                .findFirst()
                .map(sa -> sa.getEmail())
                .orElse(null);

        String phone = staff.getStaffAddresses().stream()
                .filter(sa -> sa.getIsMain() != null && sa.getIsMain())
                .findFirst()
                .map(sa -> sa.getPhone())
                .orElse(null);

        String status = staff.getIsActive() ? "ACTIVE" : "INACTIVE";

        return OfficeStaffDTO.builder()
                .id(staff.getId())
                .employeeId(staff.getEmployeeId())
                .firstName(staff.getFirstName())
                .lastName(staff.getLastName())
                .fullName(staff.getFirstName() + " " + staff.getLastName())
                .email(email)
                .phone(phone)
                .role(roleName)
                .hireDate(staff.getHireDate())
                .releaseDate(staff.getReleaseDate())
                .isActive(staff.getIsActive())
                .status(status)
                .build();
    }

    private OfficePatientDTO convertToOfficePatientDTO(Patient patient) {
        String email = patient.getPatientAddresses().stream()
                .filter(pa -> pa.getIsMain() != null && pa.getIsMain())
                .findFirst()
                .map(pa -> pa.getEmail())
                .orElse(null);

        String phone = patient.getPatientAddresses().stream()
                .filter(pa -> pa.getIsMain() != null && pa.getIsMain())
                .findFirst()
                .map(pa -> pa.getPhone())
                .orElse(null);

        String statusStr = patient.getStatus() != null ? patient.getStatus().toString() : null;

        return OfficePatientDTO.builder()
                .id(patient.getId())
                .patientCode(patient.getClientId())
                .firstName(patient.getFirstName())
                .lastName(patient.getLastName())
                .fullName(patient.getFirstName() + " " + patient.getLastName())
                .dateOfBirth(patient.getDob())
                .gender(patient.getGender()) 
                .phone(phone)
                .email(email)
                .status(statusStr)
                .isActive("ACTIVE".equals(statusStr))
                .build();
    }
}
