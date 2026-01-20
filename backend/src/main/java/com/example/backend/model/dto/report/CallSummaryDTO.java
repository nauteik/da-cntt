package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

/**
 * DTO for Call Summary report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallSummaryDTO {
    
    private String officeId;
    private String clientId;
    private String clientMedicaidId;
    private String clientName;
    private String employeeName;
    private String employeeId;
    private String visitKey;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer callsStart;
    private Integer callsEnd;
    private Double hoursTotal;
    private Integer units;
}
