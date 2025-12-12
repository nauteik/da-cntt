package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Clients Without Authorizations report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientsWithoutAuthReportDTO {
    
    private String clientName;
    private String clientType;
    private String medicaidId;
    private String alternatePayer;
    private String payer;
    private String program;
    private String service;
    private String supervisor;
}

