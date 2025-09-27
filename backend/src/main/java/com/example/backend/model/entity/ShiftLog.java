package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashMap;
import java.util.Map;

/**
 * Shift log entity for audit trail of schedule changes
 */
@Entity
@Table(name = "shift_log")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"scheduleShift", "actor"})
public class ShiftLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_shift_id", nullable = false)
    @JsonIgnore
    private ScheduleShift scheduleShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private AppUser actor;

    @Column(name = "action", nullable = false)
    private String action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_state", columnDefinition = "jsonb")
    private Map<String, Object> beforeState = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_state", columnDefinition = "jsonb")
    private Map<String, Object> afterState = new HashMap<>();

    public ShiftLog(ScheduleShift scheduleShift, AppUser actor, String action) {
        this.scheduleShift = scheduleShift;
        this.actor = actor;
        this.action = action;
    }

    // Helper methods
    public boolean isCreated() {
        return "created".equals(action);
    }

    public boolean isUpdated() {
        return "updated".equals(action);
    }

    public boolean isCancelled() {
        return "cancelled".equals(action);
    }

    public boolean isAssigned() {
        return "assigned".equals(action);
    }

    public boolean isCompleted() {
        return "completed".equals(action);
    }
}
