package com.example.backend.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import lombok.Data;

@Data
public class ContactDTO {
    private UUID id;
    private String relation;
    private String name;
    private String phone;
    private String email;
    
    @JsonProperty("isPrimary")
    private boolean isPrimary;
}
