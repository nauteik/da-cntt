package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Set;

/**
 * Service delivery entity for actual shift records used in billing & claims
 */
@Entity
@Table(name = "service_delivery")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"scheduleShift", "office", "patient", "staff", "serviceType", "ispGoal", "dailyNotes", "medicationAdministrations"})
public class ServiceDelivery extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_shift_id")
    private ScheduleShift scheduleShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_goal_id")
    private ISPGoal ispGoal;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "units", nullable = false)
    private Integer units;

    @Column(name = "status", nullable = false)
    private String status = "in_progress";

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "pending";

    // Relationships
    @OneToMany(mappedBy = "serviceDelivery", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DailyNote> dailyNotes = new HashSet<>();

    @OneToMany(mappedBy = "serviceDelivery", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MedicationAdministration> medicationAdministrations = new HashSet<>();

    public ServiceDelivery(Patient patient, Staff staff, 
                          LocalDateTime startAt, LocalDateTime endAt, Integer units) {
        this.patient = patient;
        this.staff = staff;
        this.startAt = startAt;
        this.endAt = endAt;
        this.units = units;
    }

    // Helper methods
    public boolean isInProgress() {
        return "in_progress".equals(status);
    }

    public boolean isCompleted() {
        return "completed".equals(status);
    }

    public boolean isCancelled() {
        return "cancelled".equals(status);
    }

    public boolean isApproved() {
        return "approved".equals(approvalStatus);
    }

    public boolean isPending() {
        return "pending".equals(approvalStatus);
    }

    public boolean isRejected() {
        return "rejected".equals(approvalStatus);
    }

    public long getDurationMinutes() {
        return ChronoUnit.MINUTES.between(startAt, endAt);
    }

    public long getDurationHours() {
        return ChronoUnit.HOURS.between(startAt, endAt);
    }
}

