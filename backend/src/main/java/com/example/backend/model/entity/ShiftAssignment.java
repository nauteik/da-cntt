package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Shift assignment entity for staff-shift mapping with primary/backup support
 */
@Entity
@Table(name = "shift_assignment", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"schedule_shift_id", "staff_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"scheduleShift", "staff"})
public class ShiftAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_shift_id", nullable = false)
    @JsonIgnore
    private ScheduleShift scheduleShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @Column(name = "role", nullable = false)
    private String role = "primary";

    @Column(name = "assignment_status", nullable = false)
    private String assignmentStatus = "assigned";

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    public ShiftAssignment(ScheduleShift scheduleShift, Staff staff) {
        this.scheduleShift = scheduleShift;
        this.staff = staff;
    }

    public ShiftAssignment(ScheduleShift scheduleShift, Staff staff, String role) {
        this.scheduleShift = scheduleShift;
        this.staff = staff;
        this.role = role;
    }

    // Helper methods
    public boolean isPrimary() {
        return "primary".equals(role);
    }

    public boolean isBackup() {
        return "backup".equals(role);
    }

    public boolean isAssigned() {
        return "assigned".equals(assignmentStatus);
    }

    public boolean isAccepted() {
        return "accepted".equals(assignmentStatus);
    }

    public boolean isDeclined() {
        return "declined".equals(assignmentStatus);
    }

    public boolean isCancelled() {
        return "cancelled".equals(assignmentStatus);
    }
}
