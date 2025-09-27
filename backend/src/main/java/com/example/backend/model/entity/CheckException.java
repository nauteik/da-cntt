package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Check exception entity for GPS/time variance explanation workflow
 */
@Entity
@Table(name = "check_exception")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"checkEvent", "submittedByStaff", "approvedByStaff"})
public class CheckException extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "check_event_id", nullable = false)
    @JsonIgnore
    private CheckEvent checkEvent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by_staff_id")
    private Staff submittedByStaff;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "pending";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_staff_id")
    private Staff approvedByStaff;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    public CheckException(CheckEvent checkEvent, Staff submittedByStaff, String reason) {
        this.checkEvent = checkEvent;
        this.submittedByStaff = submittedByStaff;
        this.reason = reason;
    }

    // Helper methods
    public boolean isPending() {
        return "pending".equals(approvalStatus);
    }

    public boolean isApproved() {
        return "approved".equals(approvalStatus);
    }

    public boolean isRejected() {
        return "rejected".equals(approvalStatus);
    }

    public void approve(Staff approver) {
        this.approvalStatus = "approved";
        this.approvedByStaff = approver;
        this.approvedAt = LocalDateTime.now();
    }

    public void reject(Staff approver) {
        this.approvalStatus = "rejected";
        this.approvedByStaff = approver;
        this.approvedAt = LocalDateTime.now();
    }
}
