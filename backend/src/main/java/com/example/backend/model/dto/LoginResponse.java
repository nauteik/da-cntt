package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Login response DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String token;
    private String tokenType = "Bearer";
    private String username;
    private String displayName;
    private String email;
    private List<String> roles;
    private LocalDateTime expiresAt;
    private boolean mfaEnabled;
    
    public LoginResponse(String token, String username, String displayName, String email, 
                        List<String> roles, LocalDateTime expiresAt, boolean mfaEnabled) {
        this.token = token;
        this.username = username;
        this.displayName = displayName;
        this.email = email;
        this.roles = roles;
        this.expiresAt = expiresAt;
        this.mfaEnabled = mfaEnabled;
    }
}
