package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Mobile notification entity for push notifications about schedules, medications, etc.
 */
@Entity
@Table(name = "mobile_notification")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "user"})
public class MobileNotification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    @Column(name = "notification_type", nullable = false)
    private String notificationType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private Map<String, Object> payload = new HashMap<>();

    @Column(name = "channel", nullable = false)
    private String channel = "push";

    @Column(name = "status", nullable = false)
    private String status = "queued";

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    public MobileNotification(Organization organization, AppUser user, String notificationType) {
        this.organization = organization;
        this.user = user;
        this.notificationType = notificationType;
    }

    // Helper methods
    public boolean isQueued() {
        return "queued".equals(status);
    }

    public boolean isSent() {
        return "sent".equals(status);
    }

    public boolean isDelivered() {
        return "delivered".equals(status);
    }

    public boolean isFailed() {
        return "failed".equals(status);
    }

    public boolean isRead() {
        return readAt != null;
    }

    public void markAsSent() {
        this.status = "sent";
        this.sentAt = LocalDateTime.now();
    }

    public void markAsDelivered() {
        this.status = "delivered";
    }

    public void markAsFailed() {
        this.status = "failed";
    }

    public void markAsRead() {
        this.readAt = LocalDateTime.now();
    }

    public boolean isShiftReminder() {
        return "shift_reminder".equals(notificationType);
    }

    public boolean isMedicationReminder() {
        return "medication_reminder".equals(notificationType);
    }

    public boolean isScheduleUpdate() {
        return "schedule_update".equals(notificationType);
    }

    public boolean isEmergencyAlert() {
        return "emergency_alert".equals(notificationType);
    }

    public boolean isPushChannel() {
        return "push".equals(channel);
    }

    public boolean isSMSChannel() {
        return "sms".equals(channel);
    }

    public boolean isEmailChannel() {
        return "email".equals(channel);
    }
}
