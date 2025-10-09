package com.example.backend.service.impl;

import com.example.backend.config.properties.JwtProperties;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.dto.LoginRequest;
import com.example.backend.model.dto.UserInfoResponse;
import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Staff;
import com.example.backend.repository.AppUserRepository;
import com.example.backend.service.AuthService;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProperties jwtProperties;

    @Override
    @Transactional
    public LoginResult login(LoginRequest loginRequest) {
        final String normalizedEmail = loginRequest.getEmail().trim();
        log.info("Login attempt for email: {}", normalizedEmail);

        // Find user by email
        AppUser user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check if user is active and not deleted
        if (!user.isActiveUser()) {
            throw new UnauthorizedException("Account is inactive or suspended");
        }

        // Verify password
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        // Get display name and office from the associated Staff entity
        String displayName = Optional.ofNullable(user.getStaff())
                .map(Staff::getFullName)
                .orElse(user.getEmail());
        
        String officeId = Optional.ofNullable(user.getStaff())
                .map(staff -> staff.getOffice().getId().toString())
                .orElse(null);

        // Get user roles
        List<String> roles = user.getRoles().stream()
                .map(userRole -> userRole.getRole().getCode())
                .collect(Collectors.toList());

        // Generate JWT token with user info and officeId
        String token = generateToken(user, displayName, roles, officeId);

        // Calculate expiration time
        long expirationSeconds = jwtProperties.getExpiration();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(expirationSeconds);

        // Create user info response
        UserInfoResponse userInfo = new UserInfoResponse(
                user.getId().toString(),
                displayName,
                user.getEmail(),
                roles,
                expiresAt,
                user.isMfaEnabled(),
                officeId
        );

        // Update last login
        user.updateLastLogin();
        userRepository.save(user);

        log.info("Login successful for email: {} at office: {}", normalizedEmail, officeId);

        return new LoginResult(userInfo, token);
    }

    private String generateToken(AppUser user, String displayName, List<String> roles, String officeId) {
        Date now = new Date();
        Instant expiryInstant = Instant.now().plusSeconds(jwtProperties.getExpiration());
        Date expiryDate = Date.from(expiryInstant);

        SecretKey key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("displayName", displayName)
                .claim("roles", roles)
                .claim("officeId", officeId) // Add office ID for multi-office support
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }
}
