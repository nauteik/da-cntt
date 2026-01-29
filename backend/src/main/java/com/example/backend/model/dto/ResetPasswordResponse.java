package com.example.backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for reset password response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordResponse {

    private String newPassword;
    private String message;
}
