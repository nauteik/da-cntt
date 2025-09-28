package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Device entity for linking mobile devices and managing security
 */
@Entity
@Table(name = "device", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"device_identifier"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"user", "mobileSessions"})
public class Device extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    @Column(name = "platform", nullable = false)
    private String platform;

    @Column(name = "device_identifier", nullable = false)
    private String deviceIdentifier;

    @Column(name = "push_token")
    private String pushToken;

    @Column(name = "status", nullable = false)
    private String status = "active";

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt = LocalDateTime.now();

    // Relationships
    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MobileSession> mobileSessions = new HashSet<>();

    public Device(AppUser user, String platform, String deviceIdentifier) {
        this.user = user;
        this.platform = platform;
        this.deviceIdentifier = deviceIdentifier;
    }

    // Helper methods
    public boolean isActive() {
        return "active".equals(status);
    }

    public boolean isInactive() {
        return "inactive".equals(status);
    }

    public boolean isBlocked() {
        return "blocked".equals(status);
    }

    public boolean isIOS() {
        return "ios".equalsIgnoreCase(platform);
    }

    public boolean isAndroid() {
        return "android".equalsIgnoreCase(platform);
    }

    public boolean hasPushToken() {
        return pushToken != null && !pushToken.trim().isEmpty();
    }

    public void updatePushToken(String newToken) {
        this.pushToken = newToken;
    }

    public void deactivate() {
        this.status = "inactive";
    }

    public void block() {
        this.status = "blocked";
    }
}
