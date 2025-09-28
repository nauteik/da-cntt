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
 * Schedule shift entity for detailed shifts with planned units
 */
@Entity
@Table(name = "schedule_shift")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"weeklySchedule", "office", "patient", "serviceType", "ispGoal", "assignments", "changeRequests"})
public class ScheduleShift extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_schedule_id", nullable = false)
    @JsonIgnore
    private WeeklySchedule weeklySchedule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    @JsonIgnore
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

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

    @Column(name = "planned_units", nullable = false)
    private Integer plannedUnits;

    @Column(name = "status", nullable = false)
    private String status = "planned";

    // Relationships
    @OneToMany(mappedBy = "scheduleShift", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ShiftAssignment> assignments = new HashSet<>();

    @OneToMany(mappedBy = "scheduleShift", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ShiftChangeRequest> changeRequests = new HashSet<>();

    @OneToMany(mappedBy = "scheduleShift", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ServiceDelivery> serviceDeliveries = new HashSet<>();

    public ScheduleShift(WeeklySchedule weeklySchedule, Office office, 
                        Patient patient, LocalDateTime startAt, LocalDateTime endAt, Integer plannedUnits) {
        this.weeklySchedule = weeklySchedule;
        this.office = office;
        this.patient = patient;
        this.startAt = startAt;
        this.endAt = endAt;
        this.plannedUnits = plannedUnits;
    }

    // Helper methods
    public boolean isPlanned() {
        return "planned".equals(status);
    }

    public boolean isConfirmed() {
        return "confirmed".equals(status);
    }

    public boolean isCancelled() {
        return "cancelled".equals(status);
    }

    public long getDurationMinutes() {
        return ChronoUnit.MINUTES.between(startAt, endAt);
    }

    public long getDurationHours() {
        return ChronoUnit.HOURS.between(startAt, endAt);
    }

    public boolean isInProgress() {
        LocalDateTime now = LocalDateTime.now();
        return !startAt.isAfter(now) && endAt.isAfter(now);
    }

    public boolean isUpcoming() {
        return startAt.isAfter(LocalDateTime.now());
    }

    public boolean isCompleted() {
        return endAt.isBefore(LocalDateTime.now());
    }

    public ShiftAssignment getPrimaryAssignment() {
        return assignments.stream()
                .filter(assignment -> "primary".equals(assignment.getRole()))
                .findFirst()
                .orElse(null);
    }
}

