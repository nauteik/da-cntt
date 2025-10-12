package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for Office information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfficeDTO {
    private UUID id;
    private String code;
    private String name;
    private String county;
    private String phone;
    private String email;
    private String timezone;
    private Boolean isActive;
}
