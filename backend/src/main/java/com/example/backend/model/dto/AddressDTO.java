package com.example.backend.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;
import lombok.Data;

@Data
public class AddressDTO {
        private UUID id;
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phone;
        
        @JsonProperty("isMain")
        private boolean isMain;
}
