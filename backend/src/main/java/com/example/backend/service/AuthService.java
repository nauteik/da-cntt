package com.example.backend.service;

import com.example.backend.model.dto.LoginRequest;
import com.example.backend.model.dto.UserInfoResponse;

/**
 * Authentication service interface
 */
public interface AuthService {
    /**
     * Authenticate user and return user info with generated token
     * @param loginRequest login credentials
     * @return LoginResult containing user info and JWT token
     */
    LoginResult login(LoginRequest loginRequest);
    
    /**
     * Inner class to hold login result (user info + token)
     * Token is used internally to set HttpOnly cookie, not sent to client
     */
    record LoginResult(UserInfoResponse userInfo, String token) {}
}
