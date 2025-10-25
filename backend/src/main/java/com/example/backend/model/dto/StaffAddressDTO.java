package com.example.backend.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.UUID;

@Data
public class StaffAddressDTO {
    private UUID id;
    private String line1;
    private String line2;
    private String city;
    private String state;
    private String postalCode;
    private String county;
    private String phone;
    private String email;
    private String type;
    private String label;
    
    @JsonProperty("isMain")
    private boolean isMain;
}
