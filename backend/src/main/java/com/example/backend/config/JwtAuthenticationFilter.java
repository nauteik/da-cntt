package com.example.backend.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.backend.service.CustomUserDetailsService;
import com.example.backend.service.JwtService;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * JWT Authentication Filter - Extracts JWT from HttpOnly cookie and authenticates the user
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            // Extract JWT from Authorization header or cookie
            String token = extractJwtFromRequest(request);

            if (token != null) {
                // Extract user email and office ID from token
                String userEmail = jwtService.extractUserEmail(token);
                
                // If token contains email and no authentication is set yet
                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user details
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                    // Validate token
                    if (jwtService.isTokenValid(token, userDetails)) {
                        // Create authentication token
                        UsernamePasswordAuthenticationToken authenticationToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        authenticationToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        log.info("{} {} - Have JWT token", request.getMethod(), request.getRequestURI());
                        // Set authentication in security context
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                    } else {
                        log.info("{} {} - Invalid JWT token for user: {}", request.getMethod(), request.getRequestURI(), userEmail);
                    }
                } else if (userEmail == null) {
                    log.info("{} {} - Could not extract user email from JWT token", request.getMethod(), request.getRequestURI());
                } else {
                    log.info("{} {} - User already authenticated: {}", request.getMethod(), request.getRequestURI(), userEmail);
                }
            } else {
                log.info("{} {} - No JWT token", request.getMethod(), request.getRequestURI());
            }
        } catch (JwtException e) {
            log.info("{} {} - JWT validation error: {}", request.getMethod(), request.getRequestURI(), e.getMessage());
        } catch (Exception e) {
            log.info("{} {} - Could not set user authentication in security context", request.getMethod(), request.getRequestURI(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from Authorization header (Bearer token) or cookie
     * Priority: Authorization header > Cookie
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        // 1. Try to extract from Authorization header (for mobile/API clients)
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            log.info("JWT found in Authorization header");
            return authHeader.substring(7);
        }

        // 2. Try to extract from cookie (for web clients)
        if (request.getCookies() != null) {
            Optional<Cookie> jwtCookie = Arrays.stream(request.getCookies())
                    .filter(cookie -> "accessToken".equals(cookie.getName()))
                    .findFirst();
            
            if (jwtCookie.isPresent()) {
                return jwtCookie.get().getValue();
            }
        }

        log.debug("No JWT token found in request");
        return null;
    }
}