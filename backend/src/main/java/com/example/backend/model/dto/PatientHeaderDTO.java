package com.example.backend.model.dto;

import com.example.backend.model.enums.PatientStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for patient header information displayed across all tabs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientHeaderDTO {
    
    private UUID id;
    
    private String clientName; // firstName + lastName from Patient
    
    private String clientId; // From Patient
    
    private String medicaidId; // From Patient
    
    private String mainAddress; // From PatientAddress/Address (where isMain = true)
    
    private String phoneNo; // From PatientAddress/Address (where isMain = true)
    
    private String mainEmergencyContact; // From PatientContact (where isPrimary = true)
    
    private String programName; // Program name from PatientProgram/Program
    
    private PatientStatus status; // From Patient (PENDING, ACTIVE, INACTIVE)
    
    /**
     * Constructor for JPQL projection queries
     */
    public PatientHeaderDTO(UUID id, String firstName, String lastName, String clientId,
                           String medicaidId, String mainAddress, String phoneNo,
                           String mainEmergencyContact, String programName, PatientStatus status) {
        this.id = id;
        this.clientName = firstName + " " + lastName;
        this.clientId = clientId;
        this.medicaidId = medicaidId;
        this.mainAddress = mainAddress;
        this.phoneNo = phoneNo;
        this.mainEmergencyContact = mainEmergencyContact;
        this.programName = programName;
        this.status = status;
    }
    
    /**
     * Constructor for native query results.
     * Native queries may return String for status enum
     */
    public PatientHeaderDTO(UUID id, String firstName, String lastName, String clientId,
                           String medicaidId, String mainAddress, String phoneNo,
                           String mainEmergencyContact, String programName, String status) {
        this.id = id;
        this.clientName = firstName + " " + lastName;
        this.clientId = clientId;
        this.medicaidId = medicaidId;
        this.mainAddress = mainAddress;
        this.phoneNo = phoneNo;
        this.mainEmergencyContact = mainEmergencyContact;
        this.programName = programName;
        this.status = status != null ? PatientStatus.valueOf(status) : null;
    }
}
