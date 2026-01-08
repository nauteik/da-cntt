package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

/**
 * Base filter DTO for authorization reports
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportFilterDTO {
    
    private LocalDate fromDate;
    private LocalDate toDate;
    private LocalTime fromTime;
    private LocalTime toTime;
    
    // Filter by payer IDs
    private List<UUID> payerIds;
    
    // Filter by program IDs
    private List<UUID> programIds;
    
    // Filter by service type IDs
    private List<UUID> serviceTypeIds;
    
    // Client search filters
    private String clientSearch;
    private String clientMedicaidId;
    
    // Client ID for specific filtering
    private String clientId;
    
    // Expires after days (for expiring auth report)
    private Integer expiresAfterDays;
}

