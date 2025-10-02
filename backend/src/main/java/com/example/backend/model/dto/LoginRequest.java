package com.example.backend.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Login request DTO
 */
@Data
public class LoginRequest {
    
    @NotBlank(message = "Email is required")
    @Size(min = 3, max = 50, message = "Email must be between 3 and 50 characters")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
