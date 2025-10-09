package com.example.backend.controller;

import com.example.backend.model.ApiResponse;
import com.example.backend.model.dto.UserInfoResponse;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Staff;
import com.example.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * User REST Controller
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final AppUserRepository userRepository;

    /**
     * Get current authenticated user information
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserInfoResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Not authenticated", 401, "/api/user/me", null));
        }

        String email = authentication.getName(); // The email is stored as the principal
        log.info("Fetching user info for: {}", email);

        // Find user by email
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        // Get display name and office from the associated Staff entity
        String displayName = Optional.ofNullable(user.getStaff())
                .map(Staff::getFullName)
                .orElse(user.getEmail());

        String officeId = Optional.ofNullable(user.getStaff())
                .map(staff -> staff.getOffice().getId().toString())
                .orElse(null);

        // Get user roles from authentication (already loaded by Spring Security)
        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", "")) // Remove "ROLE_" prefix
                .collect(Collectors.toList());

        UserInfoResponse userInfo = new UserInfoResponse(
                user.getId().toString(),
                displayName,
                user.getEmail(),
                roles,
                LocalDateTime.now().plusHours(1), // Token expiry (you might want to extract this from JWT)
                user.isMfaEnabled(),
                officeId
        );

        return ResponseEntity.ok(ApiResponse.success(userInfo, "User info retrieved successfully"));
    }
}
