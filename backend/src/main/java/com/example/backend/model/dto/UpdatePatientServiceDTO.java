package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for updating patient service assignment.
 * All fields are optional for PATCH semantics.
 * Used for PATCH /api/patients/{id}/services/{serviceId}
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientServiceDTO {

    private UUID serviceTypeId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Map<String, Object> meta;
}

