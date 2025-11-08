package com.example.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.ServiceDeliveryCheckInCheckOutResponse;
import com.example.backend.dto.ServiceDeliveryCheckInRequest;
import com.example.backend.dto.ServiceDeliveryCheckOutRequest;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.entity.CheckEvent;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.PatientAddress;
import com.example.backend.model.entity.ServiceDelivery;
import com.example.backend.model.entity.Staff;
import com.example.backend.model.enums.CheckEventStatus;
import com.example.backend.model.enums.CheckEventType;
import com.example.backend.repository.ServiceDeliveryRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.util.GeoUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceDeliveryCheckInCheckOutService {

    private final ServiceDeliveryRepository serviceDeliveryRepository;
    private final StaffRepository staffRepository;

    /**
     * Process check-in for a service delivery with GPS validation
     */
    @Transactional
    public ServiceDeliveryCheckInCheckOutResponse checkIn(ServiceDeliveryCheckInRequest request) {
        log.info("Processing check-in for service delivery: {}", request.getServiceDeliveryId());

        // Validate coordinates
        if (!GeoUtils.isValidCoordinates(request.getLatitude(), request.getLongitude())) {
            throw new ValidationException("Invalid GPS coordinates");
        }

        // Get service delivery
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(request.getServiceDeliveryId())
            .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));

        // Check if already checked in
        if (serviceDelivery.getCheckInEvent() != null) {
            throw new ValidationException("Already checked in for this service delivery");
        }

        // Get patient and address with coordinates
        Patient patient = serviceDelivery.getPatient();
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
        CheckEventStatus status = isValid ? CheckEventStatus.OK : CheckEventStatus.GPS_MISMATCH;

        log.info("Check-in distance: {}m, valid: {}, status: {}", distance, isValid, status);

        // Create check-in event
        CheckEvent checkInEvent = new CheckEvent();
        checkInEvent.setStaff(serviceDelivery.getStaff());
        checkInEvent.setPatient(patient);
        checkInEvent.setScheduleEvent(serviceDelivery.getScheduleEvent());
        checkInEvent.setEventType(CheckEventType.CHECK_IN);
        checkInEvent.setOccurredAt(LocalDateTime.now());
        checkInEvent.setLatitude(BigDecimal.valueOf(request.getLatitude()));
        checkInEvent.setLongitude(BigDecimal.valueOf(request.getLongitude()));
        // Cap accuracy_m at 9999.99 to fit NUMERIC(6,2) constraint
        checkInEvent.setAccuracyM(BigDecimal.valueOf(Math.min(distance, 9999.99)));
        checkInEvent.setStatus(status);
        checkInEvent.setMethod("mobile");

        // Add check-in event to service delivery
        serviceDelivery.addCheckInEvent(checkInEvent);
        serviceDeliveryRepository.save(serviceDelivery);

        return mapToResponse(serviceDelivery, patient, patientAddress);
    }

    /**
     * Process check-out for a service delivery with GPS validation
     */
    @Transactional
    public ServiceDeliveryCheckInCheckOutResponse checkOut(ServiceDeliveryCheckOutRequest request) {
        log.info("Processing check-out for service delivery: {}", request.getServiceDeliveryId());

        // Validate coordinates
        if (!GeoUtils.isValidCoordinates(request.getLatitude(), request.getLongitude())) {
            throw new ValidationException("Invalid GPS coordinates");
        }

        // Get service delivery
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(request.getServiceDeliveryId())
            .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));

        // Validate already checked in
        if (serviceDelivery.getCheckInEvent() == null) {
            throw new ValidationException("Must check in before checking out");
        }

        // Validate not already checked out
        if (serviceDelivery.getCheckOutEvent() != null) {
            throw new ValidationException("Already checked out");
        }

        // Get patient address
        Patient patient = serviceDelivery.getPatient();
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
        CheckEventStatus status = isValid ? CheckEventStatus.OK : CheckEventStatus.GPS_MISMATCH;

        log.info("Check-out distance: {}m, valid: {}, status: {}", distance, isValid, status);

        // Create check-out event
        CheckEvent checkOutEvent = new CheckEvent();
        checkOutEvent.setStaff(serviceDelivery.getStaff());
        checkOutEvent.setPatient(patient);
        checkOutEvent.setScheduleEvent(serviceDelivery.getScheduleEvent());
        checkOutEvent.setEventType(CheckEventType.CHECK_OUT);
        checkOutEvent.setOccurredAt(LocalDateTime.now());
        checkOutEvent.setLatitude(BigDecimal.valueOf(request.getLatitude()));
        checkOutEvent.setLongitude(BigDecimal.valueOf(request.getLongitude()));
        // Cap accuracy_m at 9999.99 to fit NUMERIC(6,2) constraint
        checkOutEvent.setAccuracyM(BigDecimal.valueOf(Math.min(distance, 9999.99)));
        checkOutEvent.setStatus(status);
        checkOutEvent.setMethod("mobile");

        // Add check-out event to service delivery (automatically calculates total hours)
        serviceDelivery.addCheckOutEvent(checkOutEvent);
        
        // Tự động cập nhật units dựa trên thời gian thực tế check-in/check-out
        // 1 unit = 15 phút, tính từ totalHours
        if (serviceDelivery.getTotalHours() != null) {
            int actualUnits = (int) Math.ceil(serviceDelivery.getTotalHours() * 4); // 1 hour = 4 units
            serviceDelivery.setUnits(actualUnits);
            
            // NOTE: KHÔNG cập nhật startAt/endAt vì đó là thời gian DỰ KIẾN từ ScheduleEvent
            // Thời gian THỰC TẾ được lưu trong CheckEvent và truy cập qua getCheckInTime()/getCheckOutTime()
            
            log.info("Updated service delivery units to {} based on actual hours: {}", 
                actualUnits, serviceDelivery.getTotalHours());
        }
        
        serviceDeliveryRepository.save(serviceDelivery);

        return mapToResponse(serviceDelivery, patient, patientAddress);
    }

    /**
     * Get check-in/check-out info by service delivery ID
     */
    @Transactional(readOnly = true)
    public ServiceDeliveryCheckInCheckOutResponse getById(UUID serviceDeliveryId) {
        ServiceDelivery serviceDelivery = serviceDeliveryRepository.findById(serviceDeliveryId)
            .orElseThrow(() -> new ResourceNotFoundException("Service delivery not found"));

        Patient patient = serviceDelivery.getPatient();
        PatientAddress patientAddress = patient.getPatientAddresses().stream()
            .filter(PatientAddress::getIsMain)
            .findFirst()
            .orElse(null);

        return mapToResponse(serviceDelivery, patient, patientAddress);
    }

    /**
     * Get all check-in/check-out records for a staff member
     */
    @Transactional(readOnly = true)
    public List<ServiceDeliveryCheckInCheckOutResponse> getByStaff(UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        return serviceDeliveryRepository.findByStaffOrderByStartAtDesc(staff).stream()
            .map(serviceDelivery -> {
                Patient patient = serviceDelivery.getPatient();
                PatientAddress patientAddress = patient.getPatientAddresses().stream()
                    .filter(PatientAddress::getIsMain)
                    .findFirst()
                    .orElse(null);
                return mapToResponse(serviceDelivery, patient, patientAddress);
            })
            .collect(Collectors.toList());
    }

    /**
     * Get incomplete check-outs for a staff member (checked in but not checked out)
     */
    @Transactional(readOnly = true)
    public List<ServiceDeliveryCheckInCheckOutResponse> getIncompleteByStaff(UUID staffId) {
        Staff staff = staffRepository.findById(staffId)
            .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        return serviceDeliveryRepository.findByStaffOrderByStartAtDesc(staff).stream()
            .filter(sd -> sd.getCheckInEvent() != null && sd.getCheckOutEvent() == null)
            .map(serviceDelivery -> {
                Patient patient = serviceDelivery.getPatient();
                PatientAddress patientAddress = patient.getPatientAddresses().stream()
                    .filter(PatientAddress::getIsMain)
                    .findFirst()
                    .orElse(null);
                return mapToResponse(serviceDelivery, patient, patientAddress);
            })
            .collect(Collectors.toList());
    }

    /**
     * Get all invalid check-in/check-out records (outside 1km)
     */
    @Transactional(readOnly = true)
    public List<ServiceDeliveryCheckInCheckOutResponse> getInvalidCheckInCheckOuts() {
        return serviceDeliveryRepository.findAll().stream()
            .filter(sd -> !sd.isCheckInCheckOutFullyValid())
            .map(serviceDelivery -> {
                Patient patient = serviceDelivery.getPatient();
                PatientAddress patientAddress = patient.getPatientAddresses().stream()
                    .filter(PatientAddress::getIsMain)
                    .findFirst()
                    .orElse(null);
                return mapToResponse(serviceDelivery, patient, patientAddress);
            })
            .collect(Collectors.toList());
    }

    /**
     * Map entity to response DTO
     */
    private ServiceDeliveryCheckInCheckOutResponse mapToResponse(ServiceDelivery serviceDelivery, Patient patient, PatientAddress patientAddress) {
        ServiceDeliveryCheckInCheckOutResponse response = new ServiceDeliveryCheckInCheckOutResponse();
        
        response.setId(serviceDelivery.getId());
        response.setServiceDeliveryId(serviceDelivery.getId());
        response.setPatientId(patient.getId());
        response.setPatientName(patient.getFirstName() + " " + patient.getLastName());
        
        Staff staff = serviceDelivery.getStaff();
        if (staff != null) {
            response.setStaffId(staff.getId());
            response.setStaffName(staff.getFirstName() + " " + staff.getLastName());
        }

        // Check-in info
        CheckEvent checkInEvent = serviceDelivery.getCheckInEvent();
        if (checkInEvent != null) {
            response.setCheckInTime(checkInEvent.getOccurredAt());
            response.setCheckInLatitude(checkInEvent.getLatitude() != null ? checkInEvent.getLatitude().doubleValue() : null);
            response.setCheckInLongitude(checkInEvent.getLongitude() != null ? checkInEvent.getLongitude().doubleValue() : null);
            response.setCheckInLocation(null); // CheckEvent doesn't have address field
            
            // Calculate actual distance (not capped value from accuracy_m)
            if (checkInEvent.getLatitude() != null && checkInEvent.getLongitude() != null && 
                patientAddress != null && patientAddress.getLatitude() != null && patientAddress.getLongitude() != null) {
                double actualDistance = GeoUtils.calculateDistance(
                    checkInEvent.getLatitude().doubleValue(), checkInEvent.getLongitude().doubleValue(),
                    patientAddress.getLatitude(), patientAddress.getLongitude()
                );
                response.setCheckInDistanceMeters(actualDistance);
                response.setCheckInDistanceFormatted(
                    actualDistance < 1000 ? 
                    String.format("%.2f m", actualDistance) : 
                    String.format("%.2f km", actualDistance / 1000.0)
                );
            }
            
            response.setCheckInValid(checkInEvent.isOK());
        }

        // Check-out info
        CheckEvent checkOutEvent = serviceDelivery.getCheckOutEvent();
        if (checkOutEvent != null) {
            response.setCheckOutTime(checkOutEvent.getOccurredAt());
            response.setCheckOutLatitude(checkOutEvent.getLatitude() != null ? checkOutEvent.getLatitude().doubleValue() : null);
            response.setCheckOutLongitude(checkOutEvent.getLongitude() != null ? checkOutEvent.getLongitude().doubleValue() : null);
            response.setCheckOutLocation(null); // CheckEvent doesn't have address field
            
            // Calculate actual distance (not capped value from accuracy_m)
            if (checkOutEvent.getLatitude() != null && checkOutEvent.getLongitude() != null && 
                patientAddress != null && patientAddress.getLatitude() != null && patientAddress.getLongitude() != null) {
                double actualDistance = GeoUtils.calculateDistance(
                    checkOutEvent.getLatitude().doubleValue(), checkOutEvent.getLongitude().doubleValue(),
                    patientAddress.getLatitude(), patientAddress.getLongitude()
                );
                response.setCheckOutDistanceMeters(actualDistance);
                response.setCheckOutDistanceFormatted(
                    actualDistance < 1000 ? 
                    String.format("%.2f m", actualDistance) : 
                    String.format("%.2f km", actualDistance / 1000.0)
                );
            }
            
            response.setCheckOutValid(checkOutEvent.isOK());
        }

        response.setTotalHours(serviceDelivery.getTotalHours());
        response.setIsCompleted(serviceDelivery.isCheckInCheckOutCompleted());
        response.setIsFullyValid(serviceDelivery.isCheckInCheckOutFullyValid());

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
