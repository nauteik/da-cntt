package com.example.backend.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User info response DTO (returned to client after login or for /me endpoint)
 * Now includes token for BFF pattern - token will be extracted and stored in HttpOnly cookie
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    
    private String userId;
    private String staffId; // Staff ID for DSP role (UUID as string)
    private String displayName;
    private String email;
    private List<String> roles;
    private LocalDateTime expiresAt;
    private boolean mfaEnabled;
    private String officeId; // Multi-office support (UUID as string)
    private String token; // JWT token for BFF pattern
}
