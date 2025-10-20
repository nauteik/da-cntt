package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
public class PayerDetailDTO {

    private UUID patientPayerId;

    private String payerName;

    private String payerIdentifier;

    private Integer rank;

    private String clientPayerId;

    private LocalDate startDate;

    private String groupNo;

    private LocalDate endDate;
    
}


