package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for Call Listing report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallListingDTO {
    
    private String serviceId;
    private String accountName;
    private String accountId;
    private String clientId;
    private String clientMedicaidId;
    private String clientName;
    private String phone;
    private String employeeName;
    private String employeeId;
    private LocalDate visitDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private LocalTime callInTime;
    private LocalTime callOutTime;
    private String visitKey;
    private String groupCode;
    private String status;
    private String indicators;
}
