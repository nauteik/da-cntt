package com.example.backend.model.dto;

import com.example.backend.model.enums.PatientStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for patient summary listing
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientSummaryDTO {
    
    private UUID id;
    
    private String clientName; // firstName + lastName
    
    private PatientStatus status;
    
    private String program; // From PatientProgram
    
    private String supervisor; // From supervisor Staff entity
    
    private String medicaidId; // From Patient
    
    private String clientPayerId; // From PatientPayer
    
    private LocalDate asOf; // statusEffectiveDate from PatientProgram
    
    private LocalDate soc; // socDate from PatientProgram
    
    private LocalDate eoc; // eocDate from PatientProgram
    
    private List<String> services; // List of service type codes from PatientService
    
    /**
     * Constructor for JPQL projection queries
     */
    public PatientSummaryDTO(UUID id, String firstName, String lastName, PatientStatus status,
                           String program, String supervisorFirstName, String supervisorLastName,
                           String medicaidId, String clientPayerId, LocalDate asOf, 
                           LocalDate soc, LocalDate eoc) {
        this.id = id;
        this.clientName = firstName + " " + lastName;
        this.status = status;
        this.program = program;
        this.supervisor = (supervisorFirstName != null && supervisorLastName != null) 
            ? supervisorFirstName + " " + supervisorLastName 
            : null;
        this.medicaidId = medicaidId;
        this.clientPayerId = clientPayerId;
        this.asOf = asOf;
        this.soc = soc;
        this.eoc = eoc;
    }
    
    /**
     * Constructor for native query with array_agg.
     * Native queries return java.sql.Date (not java.time.LocalDate) and Object[] (not String[])
     */
    public PatientSummaryDTO(UUID id, String firstName, String lastName, String status,
                           String program, String supervisorFirstName, String supervisorLastName,
                           String medicaidId, String clientPayerId, java.sql.Date asOf, 
                           java.sql.Date soc, java.sql.Date eoc, Object[] services) {
        this.id = id;
        this.clientName = firstName + " " + lastName;
        this.status = status != null ? PatientStatus.valueOf(status) : null;
        this.program = program;
        this.supervisor = (supervisorFirstName != null && supervisorLastName != null) 
            ? supervisorFirstName + " " + supervisorLastName 
            : null;
        this.medicaidId = medicaidId;
        this.clientPayerId = clientPayerId;
        // Convert java.sql.Date to java.time.LocalDate
        this.asOf = asOf != null ? asOf.toLocalDate() : null;
        this.soc = soc != null ? soc.toLocalDate() : null;
        this.eoc = eoc != null ? eoc.toLocalDate() : null;
        // Convert Object[] to List<String>
        if (services != null && services.length > 0) {
            this.services = java.util.Arrays.stream(services)
                .map(Object::toString)
                .toList();
        } else {
            this.services = List.of();
        }
    }
}
