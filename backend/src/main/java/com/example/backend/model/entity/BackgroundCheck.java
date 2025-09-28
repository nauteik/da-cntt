package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

/**
 * Background check entity for staff background check history
 */
@Entity
@Table(name = "background_check")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"staff", "evidenceFile"})
public class BackgroundCheck extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @Column(name = "check_type", nullable = false)
    private String checkType;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "checked_at")
    private LocalDate checkedAt;

    @Column(name = "next_due_at")
    private LocalDate nextDueAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evidence_file_id")
    private FileObject evidenceFile;

    public BackgroundCheck(Staff staff, String checkType, String status) {
        this.staff = staff;
        this.checkType = checkType;
        this.status = status;
    }

    // Helper methods
    public boolean isPassed() {
        return "passed".equals(status) || "cleared".equals(status);
    }

    public boolean isFailed() {
        return "failed".equals(status) || "flagged".equals(status);
    }

    public boolean isPending() {
        return "pending".equals(status) || "in_progress".equals(status);
    }

    public boolean isDue() {
        return nextDueAt != null && nextDueAt.isBefore(LocalDate.now().plusDays(1));
    }

    public boolean isOverdue() {
        return nextDueAt != null && nextDueAt.isBefore(LocalDate.now());
    }

    public long getDaysUntilDue() {
        if (nextDueAt == null) return Long.MAX_VALUE;
        return LocalDate.now().until(nextDueAt).getDays();
    }
}

