package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for staff summary listing
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffSummaryDTO {
    
    private UUID id;
    
    private String name; // firstName + lastName
    
    private String status; // "ACTIVE" or "INACTIVE" based on isActive
    
    private String employeeId;
    
    private String position; // role code from AppUser.role.code
    
    private LocalDate hireDate;
    
    private LocalDate releaseDate;
    
    private LocalDateTime updatedAt;
    
    /**
     * Constructor for native query projection - matches SQL query result order exactly
     * SQL returns: id, first_name, last_name, status, employee_id, position, hire_date, release_date, updated_at
     */
    public StaffSummaryDTO(UUID id, String firstName, String lastName, String status,
                           String employeeId, String position, Object hireDate, 
                           Object releaseDate, Object updatedAt) {
        this.id = id;
        this.name = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
        this.status = status;
        this.employeeId = employeeId;
        this.position = position;
        
        // Handle date conversion with type checking
        if (hireDate instanceof java.sql.Date) {
            this.hireDate = ((java.sql.Date) hireDate).toLocalDate();
        } else if (hireDate instanceof java.time.LocalDate) {
            this.hireDate = (java.time.LocalDate) hireDate;
        } else {
            this.hireDate = null;
        }
        
        if (releaseDate instanceof java.sql.Date) {
            this.releaseDate = ((java.sql.Date) releaseDate).toLocalDate();
        } else if (releaseDate instanceof java.time.LocalDate) {
            this.releaseDate = (java.time.LocalDate) releaseDate;
        } else {
            this.releaseDate = null;
        }
        
        // Handle timestamp conversion with type checking
        if (updatedAt instanceof java.sql.Timestamp) {
            this.updatedAt = ((java.sql.Timestamp) updatedAt).toLocalDateTime();
        } else if (updatedAt instanceof java.time.LocalDateTime) {
            this.updatedAt = (java.time.LocalDateTime) updatedAt;
        } else {
            this.updatedAt = null;
        }
    }
}
