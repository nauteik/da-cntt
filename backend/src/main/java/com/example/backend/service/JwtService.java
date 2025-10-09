package com.example.backend.service;

import com.example.backend.config.properties.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

/**
 * Service for JWT token operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {

    private final JwtProperties jwtProperties;

    /**
     * Validate and parse JWT token
     */
    public Jws<Claims> validateToken(String token) throws JwtException {
        SecretKey key = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
    }

    /**
     * Extract user email from token
     */
    public String extractUserEmail(String token) {
        try {
            Jws<Claims> claimsJws = validateToken(token);
            return claimsJws.getPayload().get("email", String.class);
        } catch (JwtException e) {
            log.error("Failed to extract email from token", e);
            return null;
        }
    }

    /**
     * Extract user ID from token
     */
    public String extractUserId(String token) {
        try {
            Jws<Claims> claimsJws = validateToken(token);
            return claimsJws.getPayload().getSubject();
        } catch (JwtException e) {
            log.error("Failed to extract user ID from token", e);
            return null;
        }
    }

    /**
     * Extract roles from token
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        try {
            Jws<Claims> claimsJws = validateToken(token);
            return (List<String>) claimsJws.getPayload().get("roles");
        } catch (JwtException e) {
            log.error("Failed to extract roles from token", e);
            return List.of();
        }
    }

    /**
     * Extract office ID from token
     */
    public String extractOfficeId(String token) {
        try {
            Jws<Claims> claimsJws = validateToken(token);
            return claimsJws.getPayload().get("officeId", String.class);
        } catch (JwtException e) {
            log.error("Failed to extract office ID from token", e);
            return null;
        }
    }

    /**
     * Check if token is valid and not expired
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String email = extractUserEmail(token);
            return email != null && email.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (JwtException e) {
            log.error("Token validation failed", e);
            return false;
        }
    }

    /**
     * Check if token is expired
     */
    private boolean isTokenExpired(String token) {
        try {
            Jws<Claims> claimsJws = validateToken(token);
            Date expiration = claimsJws.getPayload().getExpiration();
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }
}
