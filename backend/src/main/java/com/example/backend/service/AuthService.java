package com.example.backend.service;

import com.example.backend.model.dto.LoginRequest;
import com.example.backend.model.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest loginRequest);
}
