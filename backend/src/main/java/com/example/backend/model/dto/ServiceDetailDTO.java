package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
public class ServiceDetailDTO {

    private String serviceName;

    private String serviceCode;

    private LocalDate startDate;

    private LocalDate endDate;
}


