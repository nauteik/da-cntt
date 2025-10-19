package com.example.backend.config;

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
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

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

        log.info("Processing request: {} {}", request.getMethod(), request.getRequestURI());
        
        // Log all cookies for debugging
        if (request.getCookies() != null) {
            log.info("Cookies received: {}", Arrays.toString(request.getCookies()));
        } else {
            log.warn("No cookies received for request: {} {}", request.getMethod(), request.getRequestURI());
        }

        try {
            // Extract JWT from cookie
            Optional<Cookie> jwtCookie = extractJwtCookie(request);

            if (jwtCookie.isPresent()) {
                log.info("JWT cookie found: {}", jwtCookie.get().getName());
                String token = jwtCookie.get().getValue();

                // Extract user email and office ID from token
                String userEmail = jwtService.extractUserEmail(token);
                String officeId = jwtService.extractOfficeId(token);

                log.info("Extracted userEmail: {}, officeId: {}", userEmail, officeId);

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

                        // Set authentication in security context
                        SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                        log.info("User '{}' authenticated successfully for office '{}'", userEmail, officeId);
                    } else {
                        log.warn("Invalid JWT token for user: {}", userEmail);
                    }
                } else if (userEmail == null) {
                    log.warn("Could not extract user email from JWT token");
                } else {
                    log.info("User already authenticated: {}", userEmail);
                }
            } else {
                log.warn("No JWT cookie found for request: {} {}", request.getMethod(), request.getRequestURI());
            }
        } catch (JwtException e) {
            log.error("JWT validation error: {}", e.getMessage());
        } catch (Exception e) {
            log.error("Could not set user authentication in security context", e);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract JWT token from 'accessToken' cookie
     */
    private Optional<Cookie> extractJwtCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return Optional.empty();
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> "accessToken".equals(cookie.getName()))
                .findFirst();
    }
}