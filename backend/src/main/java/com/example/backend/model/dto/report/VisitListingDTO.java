package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for Visit Listing report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitListingDTO {
    
    private String payerId;
    private String accountName;
    private String accountId;
    private String providerId;
    private String clientMedicaidId;
    private String clientName;
    private String employeeName;
    private String employeeId;
    private LocalDate visitDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String visitKey;
    private String status;
}
