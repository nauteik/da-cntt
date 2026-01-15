package com.example.backend.model.dto.report;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for Active Clients report
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveClientDTO {
    
    private String accountName;
    private String providerId;
    private String clientMedicaidId;
    private String clientName;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String zip;
    private String county;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDate activeSinceDate;
    private Long totalActiveClients;
}
