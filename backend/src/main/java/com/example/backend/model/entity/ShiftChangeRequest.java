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
 * Shift change request entity for change workflow
 */
@Entity
@Table(name = "shift_change_request")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"scheduleShift", "requestedByStaff", "approvals"})
public class ShiftChangeRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_shift_id", nullable = false)
    @JsonIgnore
    private ScheduleShift scheduleShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by_staff_id", nullable = false)
    @JsonIgnore
    private Staff requestedByStaff;

    @Column(name = "request_type", nullable = false)
    private String requestType;

    @Column(name = "reason")
    private String reason;

    @Column(name = "status", nullable = false)
    private String status = "pending";

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    // Relationships
    @OneToMany(mappedBy = "changeRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ShiftChangeApproval> approvals = new HashSet<>();

    public ShiftChangeRequest(ScheduleShift scheduleShift, Staff requestedByStaff, String requestType) {
        this.scheduleShift = scheduleShift;
        this.requestedByStaff = requestedByStaff;
        this.requestType = requestType;
    }

    // Helper methods
    public boolean isPending() {
        return "pending".equals(status);
    }

    public boolean isApproved() {
        return "approved".equals(status);
    }

    public boolean isRejected() {
        return "rejected".equals(status);
    }

    public boolean isCancelled() {
        return "cancelled".equals(status);
    }

    public boolean isTimeOff() {
        return "time_off".equals(requestType);
    }

    public boolean isSwap() {
        return "swap".equals(requestType);
    }

    public boolean isCoverageRequest() {
        return "coverage".equals(requestType);
    }
}
