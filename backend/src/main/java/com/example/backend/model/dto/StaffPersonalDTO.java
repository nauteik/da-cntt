package com.example.backend.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class StaffPersonalDTO {
    private UUID id;
    private String ssn;
    private String status;  // "Active" or "Inactive"
    private LocalDate effectiveDate;  // hireDate
    private String employeeId;
    private String position;  // role name
    private LocalDate hireDate;
    private String supervisor;  // supervisor full name
    private UUID supervisorId;
    private String officeName;
    private UUID officeId;
    private String nationalProviderId;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String primaryLanguage;
    private String gender;
    private Boolean isSupervisor;
    private List<StaffContactDTO> contacts;
    private List<StaffAddressDTO> addresses;
}
