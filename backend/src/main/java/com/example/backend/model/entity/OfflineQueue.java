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
 * Offline queue entity for storing data when offline, sync when network available
 */
@Entity
@Table(name = "offline_queue")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"user"})
public class OfflineQueue extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private AppUser user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "jsonb")
    private Map<String, Object> payload = new HashMap<>();

    @Column(name = "operation_type", nullable = false)
    private String operationType;

    @Column(name = "sync_status", nullable = false)
    private String syncStatus = "pending";

    @Column(name = "synced_at")
    private LocalDateTime syncedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public OfflineQueue(AppUser user, String operationType, Map<String, Object> payload) {
        this.user = user;
        this.operationType = operationType;
        this.payload = payload;
    }

    // Helper methods
    public boolean isPending() {
        return "pending".equals(syncStatus);
    }

    public boolean isSynced() {
        return "synced".equals(syncStatus);
    }

    public boolean isFailed() {
        return "failed".equals(syncStatus);
    }

    public boolean isRetrying() {
        return "retrying".equals(syncStatus);
    }

    public void markAsSynced() {
        this.syncStatus = "synced";
        this.syncedAt = LocalDateTime.now();
        this.errorMessage = null;
    }

    public void markAsFailed(String error) {
        this.syncStatus = "failed";
        this.errorMessage = error;
    }

    public void markAsRetrying() {
        this.syncStatus = "retrying";
        this.errorMessage = null;
    }

    public boolean isCheckInOperation() {
        return "check_in".equals(operationType);
    }

    public boolean isCheckOutOperation() {
        return "check_out".equals(operationType);
    }

    public boolean isDailyNoteOperation() {
        return "daily_note".equals(operationType);
    }
}
