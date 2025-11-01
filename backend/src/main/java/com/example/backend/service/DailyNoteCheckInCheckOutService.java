package com.example.backend.service;

import com.example.backend.dto.DailyNoteCheckInCheckOutResponse;
import com.example.backend.dto.DailyNoteCheckInRequest;
import com.example.backend.dto.DailyNoteCheckOutRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.entity.*;
import com.example.backend.repository.DailyNoteRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyNoteCheckInCheckOutService {

    private final DailyNoteRepository dailyNoteRepository;
    private final StaffRepository staffRepository;

    /**
     * Process check-in for a daily note with GPS validation
     */
    @Transactional
    public DailyNoteCheckInCheckOutResponse checkIn(DailyNoteCheckInRequest request) {
        log.info("Processing check-in for daily note: {}", request.getDailyNoteId());

        // Validate coordinates
        if (!GeoUtils.isValidCoordinates(request.getLatitude(), request.getLongitude())) {
            throw new ValidationException("Invalid GPS coordinates");
        }

        // Get daily note
        DailyNote dailyNote = dailyNoteRepository.findById(request.getDailyNoteId())
            .orElseThrow(() -> new ResourceNotFoundException("Daily note not found"));

        // Check if already checked in
        if (dailyNote.getCheckInTime() != null) {
            throw new ValidationException("Already checked in for this daily note");
        }

        // Get patient address with coordinates
        Patient patient = dailyNote.getPatient();
        PatientAddress patientAddress = patient.getPatientAddresses().stream()
            .filter(PatientAddress::getIsMain)
            .findFirst()
            .orElseThrow(() -> new ValidationException("Patient main address not found"));

        // Validate patient address has coordinates
        if (patientAddress.getLatitude() == null || patientAddress.getLongitude() == null) {
            throw new ValidationException("Patient address coordinates not configured");
        }

        // Calculate distance from patient address
        double distance = GeoUtils.calculateDistance(
            request.getLatitude(), request.getLongitude(),
            patientAddress.getLatitude(), patientAddress.getLongitude()
        );

        // Check if within 1km radius (1000 meters)
        boolean isValid = distance <= 1000.0;

        log.info("Check-in distance: {}m, valid: {}", distance, isValid);

        // Update daily note with check-in info
        dailyNote.setCheckInTime(LocalDateTime.now());
        dailyNote.setCheckInLatitude(request.getLatitude());
        dailyNote.setCheckInLongitude(request.getLongitude());
        dailyNote.setCheckInLocation(request.getAddress());
        dailyNote.setCheckInDistanceMeters(distance);
        dailyNote.setCheckInValid(isValid);

        dailyNote = dailyNoteRepository.save(dailyNote);

        return mapToResponse(dailyNote, patient, patientAddress);
    }

    /**
     * Process check-out for a daily note with GPS validation
     */
    @Transactional
    public DailyNoteCheckInCheckOutResponse checkOut(DailyNoteCheckOutRequest request) {
        log.info("Processing check-out for daily note: {}", request.getDailyNoteId());

        // Validate coordinates
        if (!GeoUtils.isValidCoordinates(request.getLatitude(), request.getLongitude())) {
            throw new ValidationException("Invalid GPS coordinates");
        }

        // Get daily note
        DailyNote dailyNote = dailyNoteRepository.findById(request.getDailyNoteId())
            .orElseThrow(() -> new ResourceNotFoundException("Daily note not found"));

        // Validate already checked in
        if (dailyNote.getCheckInTime() == null) {
            throw new ValidationException("Must check in before checking out");
        }

        // Validate not already checked out
        if (dailyNote.getCheckOutTime() != null) {
            throw new ValidationException("Already checked out");
        }

        // Get patient address
        Patient patient = dailyNote.getPatient();
        PatientAddress patientAddress = patient.getPatientAddresses().stream()
            .filter(PatientAddress::getIsMain)
            .findFirst()
            .orElseThrow(() -> new ValidationException("Patient main address not found"));

        // Calculate distance from patient address
        double distance = GeoUtils.calculateDistance(
            request.getLatitude(), request.getLongitude(),
            patientAddress.getLatitude(), patientAddress.getLongitude()
        );

        // Check if within 1km radius
        boolean isValid = distance <= 1000.0;

        log.info("Check-out distance: {}m, valid: {}", distance, isValid);

        // Update with check-out info using helper method (calculates total hours)
        dailyNote.checkOut(
            LocalDateTime.now(),
            request.getLatitude(),
            request.getLongitude(),
            request.getAddress(),
            distance,
            isValid
        );

        dailyNote = dailyNoteRepository.save(dailyNote);

        return mapToResponse(dailyNote, patient, patientAddress);
    }

    /**
     * Get check-in/check-out info by daily note ID
     */
    @Transactional(readOnly = true)
    public DailyNoteCheckInCheckOutResponse getById(UUID dailyNoteId) {
        DailyNote dailyNote = dailyNoteRepository.findById(dailyNoteId)
            .orElseThrow(() -> new ResourceNotFoundException("Daily note not found"));

        Patient patient = dailyNote.getPatient();
        PatientAddress patientAddress = patient.getPatientAddresses().stream()
            .filter(PatientAddress::getIsMain)
            .findFirst()
            .orElse(null);

        return mapToResponse(dailyNote, patient, patientAddress);
    }

    /**
     * Get all check-in/check-out records for a staff member
     */
    @Transactional(readOnly = true)
    public List<DailyNoteCheckInCheckOutResponse> getByStaff(UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        return dailyNoteRepository.findByStaffOrderByCheckInTimeDesc(staff).stream()
            .map(dailyNote -> {
                Patient patient = dailyNote.getPatient();
                PatientAddress patientAddress = patient.getPatientAddresses().stream()
                    .filter(PatientAddress::getIsMain)
                    .findFirst()
                    .orElse(null);
                return mapToResponse(dailyNote, patient, patientAddress);
            })
            .collect(Collectors.toList());
    }

    /**
     * Get incomplete check-outs for a staff member (checked in but not checked out)
     */
    @Transactional(readOnly = true)
    public List<DailyNoteCheckInCheckOutResponse> getIncompleteByStaff(UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        return dailyNoteRepository.findIncompleteCheckOutByStaff(staff).stream()
            .map(dailyNote -> {
                Patient patient = dailyNote.getPatient();
                PatientAddress patientAddress = patient.getPatientAddresses().stream()
                    .filter(PatientAddress::getIsMain)
                    .findFirst()
                    .orElse(null);
                return mapToResponse(dailyNote, patient, patientAddress);
            })
            .collect(Collectors.toList());
    }

    /**
     * Get all invalid check-in/check-out records (outside 1km)
     */
    @Transactional(readOnly = true)
    public List<DailyNoteCheckInCheckOutResponse> getInvalidCheckInCheckOuts() {
        return dailyNoteRepository.findInvalidCheckInCheckOuts().stream()
            .map(dailyNote -> {
                Patient patient = dailyNote.getPatient();
                PatientAddress patientAddress = patient.getPatientAddresses().stream()
                    .filter(PatientAddress::getIsMain)
                    .findFirst()
                    .orElse(null);
                return mapToResponse(dailyNote, patient, patientAddress);
            })
            .collect(Collectors.toList());
    }

    /**
     * Map entity to response DTO
     */
    private DailyNoteCheckInCheckOutResponse mapToResponse(DailyNote dailyNote, Patient patient, PatientAddress patientAddress) {
        DailyNoteCheckInCheckOutResponse response = new DailyNoteCheckInCheckOutResponse();
        
        response.setId(dailyNote.getId());
        response.setServiceDeliveryId(dailyNote.getServiceDelivery() != null ? dailyNote.getServiceDelivery().getId() : null);
        response.setPatientId(patient.getId());
        response.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        
        if (dailyNote.getStaff() != null) {
            response.setStaffId(dailyNote.getStaff().getId());
            response.setStaffName(dailyNote.getStaff().getFirstName() + " " + dailyNote.getStaff().getLastName());
        }

        // Check-in info
        response.setCheckInTime(dailyNote.getCheckInTime());
        response.setCheckInLatitude(dailyNote.getCheckInLatitude());
        response.setCheckInLongitude(dailyNote.getCheckInLongitude());
        response.setCheckInLocation(dailyNote.getCheckInLocation());
        response.setCheckInDistanceMeters(dailyNote.getCheckInDistanceMeters());
        response.setCheckInDistanceFormatted(dailyNote.getCheckInDistanceFormatted());
        response.setCheckInValid(dailyNote.getCheckInValid());

        // Check-out info
        response.setCheckOutTime(dailyNote.getCheckOutTime());
        response.setCheckOutLatitude(dailyNote.getCheckOutLatitude());
        response.setCheckOutLongitude(dailyNote.getCheckOutLongitude());
        response.setCheckOutLocation(dailyNote.getCheckOutLocation());
        response.setCheckOutDistanceMeters(dailyNote.getCheckOutDistanceMeters());
        response.setCheckOutDistanceFormatted(dailyNote.getCheckOutDistanceFormatted());
        response.setCheckOutValid(dailyNote.getCheckOutValid());

        response.setTotalHours(dailyNote.getTotalHours());
        response.setIsCompleted(dailyNote.isCheckInCheckOutCompleted());
        response.setIsFullyValid(dailyNote.isCheckInCheckOutFullyValid());

        // Patient address info
        if (patientAddress != null) {
            if (patientAddress.getAddress() != null) {
                response.setPatientAddress(patientAddress.getAddress().getFullAddress());
            }
            response.setPatientLatitude(patientAddress.getLatitude());
            response.setPatientLongitude(patientAddress.getLongitude());
        }

        return response;
    }
}
