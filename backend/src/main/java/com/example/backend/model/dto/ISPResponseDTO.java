package com.example.backend.model.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

/**
 * Response DTO for ISP (Individual Service Plan)
 */
@Data
@NoArgsConstructor
public class ISPResponseDTO {
    
    private UUID id;
    private UUID patientId;
    private Integer versionNo;
    private LocalDate effectiveAt;
    private LocalDate expiresAt;
    private BigDecimal totalUnit;
    private FileObjectDTO file;
    private Map<String, Object> metadata;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    
    /**
     * Nested DTO for FileObject information
     */
    @Data
    @NoArgsConstructor
    public static class FileObjectDTO {
        private UUID id;
        private String filename;
        private String mimeType;
        private Long sizeBytes;
        private String storageUri;
    }
}
