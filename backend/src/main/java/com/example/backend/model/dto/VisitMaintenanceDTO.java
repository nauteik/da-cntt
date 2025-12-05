package com.example.backend.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.example.backend.model.enums.VisitStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Visit Maintenance screen
 * Displays comprehensive visit information for verification and billing
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitMaintenanceDTO {
    
    // IDs
    private UUID serviceDeliveryId;
    private UUID scheduleEventId;
    private UUID clientId;
    private UUID employeeId;
    
    // Client Information
    private String clientName;
    private String clientMedicaidId;
    
    // Employee Information
    private String employeeName;
    private String employeeCode;
    
    // Service Information
    private String serviceName;
    private String serviceCode;
    
    // Schedule Times
    private String visitDate;
    private String scheduledTimeIn;
    private String scheduledTimeOut;
    private Double scheduledHours;
    
    // Actual Times (Clock In/Out)
    private String callIn;
    private String callOut;
    private Double callHours;
    
    // Adjusted Times (Manual corrections)
    private String adjustedIn;
    private String adjustedOut;
    private Double adjustedHours;
    
    // Billing Information
    private Double payHours;      // Hours to pay employee
    private Double billHours;     // Hours to bill to payer
    private Integer units;        // Converted to 15-min units
    private Boolean doNotBill;    // Cancel flag (patient declined)
    
    // Status
    private VisitStatus visitStatus;
    private String visitStatusDisplay;
    
    // Additional Info
    private String notes;
    private Boolean isUnscheduled;
    private String unscheduledReason;
    private String authorizationNumber;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
