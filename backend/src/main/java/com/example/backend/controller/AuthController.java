package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.LoginRequest;
import com.example.backend.model.dto.UserInfoResponse;
import com.example.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserInfoResponse>> login(
            @Valid @RequestBody LoginRequest loginRequest) {

        // Authenticate and get user info with token
        // IMPORTANT: UserInfoResponse must now include the token string
        AuthService.LoginResult loginResult = authService.login(loginRequest);

        // REMOVE ALL HttpServletResponse and cookie logic from this endpoint.
        // Return the token in the response body.

        return ResponseEntity.ok(ApiResponse.success(loginResult.userInfo(), "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
       
        // Clear the accessToken cookie by setting maxAge to 0
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0) // Delete the cookie
                .sameSite("None"); // Use None for cross-domain requests

        // Simplified domain logic - let the browser handle it
        String origin = request.getHeader("Origin");
        // Only set domain for production Vercel deployments
        if (origin != null && origin.contains("vercel.app")) {
            cookieBuilder.domain("da-cntt.vercel.app");
        } else {
            // For localhost and other environments, don't set domain
        }

        ResponseCookie cookie = cookieBuilder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        log.info("Logout successful, cookie cleared");
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }
}