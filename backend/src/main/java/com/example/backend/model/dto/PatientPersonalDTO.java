package com.example.backend.model.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class PatientPersonalDTO {
    private UUID id;
    private String medicaidId;
    private String clientId;
    private String agencyId;
    private String ssn;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String gender;
    private String primaryLanguage;
    private Map<String, Object> medicalProfile;
    private List<ContactDTO> contacts;
    private List<AddressDTO> addresses;
    
}