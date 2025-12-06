package com.example.backend.model.dto;

import java.util.UUID;

import com.example.backend.model.enums.AddressType;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class AddressDTO {
        private UUID id;
        private String label;
        private AddressType type;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String postalCode;
        private String county;
        private String phone;
        private String email;
        
        @JsonProperty("isMain")
        private boolean isMain;
        
        // GPS coordinates
        private Double latitude;
        private Double longitude;
}
