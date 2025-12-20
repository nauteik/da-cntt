package com.example.backend.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

/**
 * Response DTO for service delivery check-in/check-out operations
 */
@Data
public class ServiceDeliveryCheckInCheckOutResponse {

    private UUID id;
    private UUID serviceDeliveryId;
    private UUID patientId;
    private String patientName;
    private UUID staffId;
    private String staffName;

    // Check-in information
    private LocalDateTime checkInTime;
    private Double checkInLatitude;
    private Double checkInLongitude;
    private String checkInLocation;
    private Double checkInDistanceMeters;
    private String checkInDistanceFormatted;
    private Boolean checkInValid;

    // Check-out information
    private LocalDateTime checkOutTime;
    private Double checkOutLatitude;
    private Double checkOutLongitude;
    private String checkOutLocation;
    private Double checkOutDistanceMeters;
    private String checkOutDistanceFormatted;
    private Boolean checkOutValid;

    // Total hours
    private Double totalHours;

    // Patient address GPS
    private Double patientLatitude;
    private Double patientLongitude;
    private String patientAddress;

    // Status flags
    private Boolean isCompleted;
    private Boolean isFullyValid;

    private String notes;
}
