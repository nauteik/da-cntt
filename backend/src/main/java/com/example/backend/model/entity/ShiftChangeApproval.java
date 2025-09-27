package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * Shift change approval entity for approval workflow
 */
@Entity
@Table(name = "shift_change_approval")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"changeRequest", "approver"})
public class ShiftChangeApproval extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_request_id", nullable = false)
    @JsonIgnore
    private ShiftChangeRequest changeRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id")
    private Staff approver;

    @Column(name = "decision", nullable = false)
    private String decision;

    @Column(name = "decided_at", nullable = false)
    private LocalDateTime decidedAt = LocalDateTime.now();

    @Column(name = "note")
    private String note;

    public ShiftChangeApproval(ShiftChangeRequest changeRequest, Staff approver, String decision) {
        this.changeRequest = changeRequest;
        this.approver = approver;
        this.decision = decision;
    }

    // Helper methods
    public boolean isApproved() {
        return "approved".equals(decision);
    }

    public boolean isRejected() {
        return "rejected".equals(decision);
    }

    public boolean needsMoreInfo() {
        return "needs_info".equals(decision);
    }
}
