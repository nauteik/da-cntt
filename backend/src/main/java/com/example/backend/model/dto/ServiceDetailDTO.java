package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
public class ServiceDetailDTO {

    private UUID patientServiceId;

    private String serviceName;

    private String serviceCode;

    private LocalDate startDate;

    private LocalDate endDate;
}


