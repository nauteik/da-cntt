package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Payer-Program-Service Listing report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayerProgramServiceListingDTO {
    
    private String payerName;
    private String programName;
    private String serviceCode;
    private String serviceName;
}
