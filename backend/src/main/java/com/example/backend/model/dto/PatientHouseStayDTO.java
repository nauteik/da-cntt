package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for Patient House Stay information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientHouseStayDTO {
    private UUID id;
    private UUID patientId;
    private String patientName;
    private UUID houseId;
    private String houseName;
    private String houseCode;
    private LocalDate moveInDate;
    private LocalDate moveOutDate;
    private Boolean isActive;
}





