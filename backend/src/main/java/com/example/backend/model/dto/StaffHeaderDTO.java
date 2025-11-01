package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for staff header information displayed across all tabs
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffHeaderDTO {
    
    private UUID id;
    
    private String staffName; // firstName + lastName from Staff
    
    private String employeeId; // From Staff
    
    private String phoneNo; // From StaffAddress (where isMain = true)
    
    private String email; // From StaffAddress (where isMain = true)
    
    private String mainEmergencyContact; // From StaffContact (where isPrimary = true)
    
    /**
     * Constructor for JPQL projection queries
     */
    public StaffHeaderDTO(UUID id, String firstName, String lastName, String employeeId,
                           String phoneNo, String email, String mainEmergencyContact) {
        this.id = id;
        this.staffName = firstName + " " + lastName;
        this.employeeId = employeeId;
        this.phoneNo = phoneNo;
        this.email = email;
        this.mainEmergencyContact = mainEmergencyContact;
    }
}
