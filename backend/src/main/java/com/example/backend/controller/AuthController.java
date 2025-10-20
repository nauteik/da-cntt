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
            @Valid @RequestBody LoginRequest loginRequest
    ) {
        log.info("Login request received for email: {}", loginRequest.getEmail());
        
        // Authenticate and get user info with token
        // IMPORTANT: UserInfoResponse must now include the token string
        AuthService.LoginResult loginResult = authService.login(loginRequest);

        // REMOVE ALL HttpServletResponse and cookie logic from this endpoint.
        // Return the token in the response body.
        
        log.info("Login successful for email: {}", loginRequest.getEmail());
        return ResponseEntity.ok(ApiResponse.success(loginResult.userInfo(), "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request, HttpServletResponse response) {
        log.info("Logout request received");

        // Clear the accessToken cookie by setting maxAge to 0
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)               // Delete the cookie
                .sameSite("None");       // Use None for cross-domain requests
        
        // Set domain based on environment (same logic as login)
        String origin = request.getHeader("Origin");
        String referer = request.getHeader("Referer");
        String userAgent = request.getHeader("User-Agent");
        log.info("Logout request - Origin: {}, Referer: {}, User-Agent: {}", origin, referer, userAgent);
        
        // Check if this is a production request (from Vercel)
        boolean isProduction = (origin != null && origin.contains("vercel.app")) ||
                              (referer != null && referer.contains("vercel.app")) ||
                              (userAgent != null && userAgent.contains("vercel"));
        
        if (isProduction) {
            // Production: set domain to frontend
            cookieBuilder.domain("da-cntt.vercel.app");
            log.info("Clearing cookie domain for production: da-cntt.vercel.app");
        } else if (origin != null && origin.contains("localhost")) {
            // Localhost: don't set domain to allow localhost to work
            log.info("Clearing cookie for localhost (no domain)");
        } else {
            // Fallback: assume production if we can't determine
            cookieBuilder.domain("da-cntt.vercel.app");
            log.info("Clearing cookie domain for production (fallback): da-cntt.vercel.app");
        }
        
        ResponseCookie cookie = cookieBuilder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        log.info("Logout successful, cookie cleared");
        return ResponseEntity.ok(ApiResponse.success("Logout successful"));
    }
}