package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * DTO for GPS Distance Exception report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GpsDistanceExceptionDTO {
    
    private String serviceId;
    private String accountName;
    private String clientName;
    private String clientMedicaidId;
    private String employeeName;
    private LocalDate visitDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal expectedDistance;
    private BigDecimal actualDistance;
    private BigDecimal variance;
    private String exceptionReason;
}
