package com.example.backend.model.dto;

import com.example.backend.model.enums.PatientStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for patient creation response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientCreatedDTO {

    private UUID id;
    private String firstName;
    private String lastName;
    private String medicaidId;
    private String clientId;
    private PatientStatus status;
    private String officeName;
    private String programName;
    private String payerName;
    private LocalDate createdAt;
}
