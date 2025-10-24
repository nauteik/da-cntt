package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for staff creation response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffCreatedDTO {

    private UUID id;
    private String firstName;
    private String lastName;
    private String employeeId;
    private String email;
    private String officeName;
    private LocalDate createdAt;
}
