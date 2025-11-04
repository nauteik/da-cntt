package com.example.backend.model.dto.schedule;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationSelectDTO {
    private UUID id;
    private String serviceCode;
    private String serviceName;
    private String eventCode;
    private String billType;
}


