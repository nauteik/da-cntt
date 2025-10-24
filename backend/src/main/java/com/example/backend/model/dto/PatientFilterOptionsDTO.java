package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for patient filter options (programs and service types)
 * Used to provide dynamic filter options to the frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientFilterOptionsDTO {
    private List<String> programs;
    private List<String> serviceTypes;
}
