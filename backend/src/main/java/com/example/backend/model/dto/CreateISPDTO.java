package com.example.backend.model.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Request DTO for creating ISP (Individual Service Plan)
 */
@Data
@NoArgsConstructor
public class CreateISPDTO {
    
    @NotNull(message = "Version number is required")
    @Positive(message = "Version number must be positive")
    private Integer versionNo;
    
    @NotNull(message = "Effective date is required")
    private LocalDate effectiveAt;
    
    private LocalDate expiresAt;
    
    private BigDecimal totalUnit;
    
    private UUID fileId; // FileObject ID from file upload
}
