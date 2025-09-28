package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Mobile session entity for linking device sessions and security management
 */
@Entity
@Table(name = "mobile_session")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"user", "device"})
public class MobileSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;

    @Column(name = "provider", nullable = false)
    private String provider = "local";

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @Column(name = "mfa_passed", nullable = false)
    private Boolean mfaPassed = false;

    public MobileSession(AppUser user, Device device) {
        this.user = user;
        this.device = device;
    }

    // Helper methods
    public boolean isActive() {
        return endedAt == null;
    }

    public boolean isEnded() {
        return endedAt != null;
    }

    public boolean isMfaPassed() {
        return Boolean.TRUE.equals(mfaPassed);
    }

    public void endSession() {
        this.endedAt = LocalDateTime.now();
    }

    public long getSessionDurationMinutes() {
        LocalDateTime end = endedAt != null ? endedAt : LocalDateTime.now();
        return ChronoUnit.MINUTES.between(startedAt, end);
    }

    public long getSessionDurationHours() {
        LocalDateTime end = endedAt != null ? endedAt : LocalDateTime.now();
        return ChronoUnit.HOURS.between(startedAt, end);
    }

    public boolean isLongSession(int hoursThreshold) {
        return getSessionDurationHours() > hoursThreshold;
    }

    public void passMFA() {
        this.mfaPassed = true;
    }
}
