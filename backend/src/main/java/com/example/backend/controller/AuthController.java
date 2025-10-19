package com.example.backend.controller;

import com.example.backend.config.properties.JwtProperties;
import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.LoginRequest;
import com.example.backend.model.dto.UserInfoResponse;
import com.example.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication REST Controller
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtProperties jwtProperties;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserInfoResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest,
            HttpServletResponse response
    ) {
        log.info("Login request received for email: {}", loginRequest.getEmail());
        
        // Authenticate and get user info with token
        AuthService.LoginResult loginResult = authService.login(loginRequest);

        // Create HttpOnly cookie with JWT token
        ResponseCookie cookie = ResponseCookie.from("accessToken", loginResult.token())
                .httpOnly(true)          // Make the cookie HttpOnly (not accessible via JavaScript)
                .secure(true)           // Set to true in production (HTTPS only)
                .path("/")               // Cookie path
                .maxAge(jwtProperties.getExpiration()) // Expiry time in seconds
                .sameSite("None")        // Allow cross-origin requests
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        log.info("Login successful for email: {}, cookie set", loginRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success(loginResult.userInfo(), "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        log.info("Logout request received");

        // Clear the accessToken cookie by setting maxAge to 0
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)               // Delete the cookie
                .sameSite("None")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        log.info("Logout successful, cookie cleared");
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }
}