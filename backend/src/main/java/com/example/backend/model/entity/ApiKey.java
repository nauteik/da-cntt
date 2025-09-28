package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * API key entity for managing integrations and external connections
 */
@Entity
@Table(name = "api_key", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"key_hash"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"keyHash", "createdByUser"})
public class ApiKey extends BaseEntity {
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "key_hash", nullable = false)
    @JsonIgnore
    private String keyHash;

    @Column(name = "scopes", nullable = false)
    private String[] scopes = {};

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;

    @Column(name = "last_used_ip")
    private String lastUsedIp;

    @Column(name = "created_by")
    private UUID createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", insertable = false, updatable = false)
    private AppUser createdByUser;

    public ApiKey(String name, String keyHash) {
        this.name = name;
        this.keyHash = keyHash;
    }

    // Helper methods
    public boolean isActive() {
        return Boolean.TRUE.equals(isActive) && !isExpired();
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean hasScope(String scope) {
        return scopes != null && Arrays.asList(scopes).contains(scope);
    }

    public boolean hasAnyScope(String... requiredScopes) {
        if (scopes == null || requiredScopes == null) return false;
        List<String> currentScopes = Arrays.asList(scopes);
        return Arrays.stream(requiredScopes).anyMatch(currentScopes::contains);
    }

    public boolean hasAllScopes(String... requiredScopes) {
        if (scopes == null || requiredScopes == null) return false;
        List<String> currentScopes = Arrays.asList(scopes);
        return Arrays.stream(requiredScopes).allMatch(currentScopes::contains);
    }

    public void updateLastUsed(String ipAddress) {
        this.lastUsedAt = LocalDateTime.now();
        this.lastUsedIp = ipAddress;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void reactivate() {
        this.isActive = true;
    }

    public boolean isRecentlyUsed(int daysThreshold) {
        return lastUsedAt != null && lastUsedAt.isAfter(LocalDateTime.now().minusDays(daysThreshold));
    }

    public long getDaysSinceLastUse() {
        if (lastUsedAt == null) return Long.MAX_VALUE;
        return java.time.temporal.ChronoUnit.DAYS.between(lastUsedAt, LocalDateTime.now());
    }

    public boolean isExpiringSoon(int daysWarning) {
        if (expiresAt == null) return false;
        return expiresAt.isBefore(LocalDateTime.now().plusDays(daysWarning));
    }
}
