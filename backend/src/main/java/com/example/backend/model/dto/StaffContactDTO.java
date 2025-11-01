package com.example.backend.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.UUID;

@Data
public class StaffContactDTO {
    private UUID id;
    private String relation;
    private String name;
    private String phone;
    private String email;
    private String line1;
    private String line2;
    
    @JsonProperty("isPrimary")
    private boolean isPrimary;
}
