package com.example.backend.model.entity;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Service delivery entity for actual shift records used in billing & claims
 * Links to ScheduleEvent for office, patient, and staff information
 * Check-in/check-out information is stored in CheckEvent entities
 */
@Entity
@Table(name = "service_delivery")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"scheduleEvent", "authorization", "dailyNotes", "medicationAdministrations", "checkEvents"})
public class ServiceDelivery extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_event_id", nullable = false)
    private ScheduleEvent scheduleEvent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_id")
    private Authorization authorization;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "units", nullable = false)
    private Integer units;

    @Column(name = "status", nullable = false)
    private String status = "in_progress"; // in_progress, completed, cancelled

    @Column(name = "approval_status", nullable = false)
    private String approvalStatus = "pending"; // pending, approved, rejected

    @Column(name = "total_hours")
    private Double totalHours;

    @Column(name = "cancelled", nullable = false)
    private Boolean cancelled = false;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_staff_id")
    private Staff cancelledByStaff;

    // === Unscheduled Visit Support ===
    /**
     * Flag indicating if this is an unscheduled visit (staff replacement)
     * When true, actualStaff is the replacement staff who performs the shift
     * instead of the originally scheduled staff in ScheduleEvent
     */
    @Column(name = "is_unscheduled", nullable = false)
    private Boolean isUnscheduled = false;

    /**
     * The actual staff who performs this service delivery
     * - For scheduled visits: same as scheduleEvent.getStaff()
     * - For unscheduled visits: the replacement/backup staff
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actual_staff_id")
    private Staff actualStaff;

    /**
     * Reason for unscheduled visit (e.g., "Original staff unavailable", "Emergency replacement")
     */
    @Column(name = "unscheduled_reason", length = 500)
    private String unscheduledReason;

    // Relationships
    @OneToMany(mappedBy = "serviceDelivery", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DailyNote> dailyNotes = new HashSet<>();

    @OneToMany(mappedBy = "serviceDelivery", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<MedicationAdministration> medicationAdministrations = new HashSet<>();

    @OneToMany(mappedBy = "serviceDelivery", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<CheckEvent> checkEvents = new HashSet<>();

    public ServiceDelivery(ScheduleEvent scheduleEvent, LocalDateTime startAt, LocalDateTime endAt, Integer units) {
        this.scheduleEvent = scheduleEvent;
        this.startAt = startAt;
        this.endAt = endAt;
        this.units = units;
        this.isUnscheduled = false;
        this.actualStaff = scheduleEvent.getStaff(); // Default to scheduled staff
    }

    /**
     * Constructor for unscheduled visit (staff replacement)
     */
    public ServiceDelivery(ScheduleEvent scheduleEvent, Staff actualStaff, String reason, 
                          LocalDateTime startAt, LocalDateTime endAt, Integer units) {
        this.scheduleEvent = scheduleEvent;
        this.actualStaff = actualStaff;
        this.isUnscheduled = true;
        this.unscheduledReason = reason;
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

    /**
     * Get office from schedule event
     */
    public Office getOffice() {
        return scheduleEvent != null ? scheduleEvent.getOffice() : null;
    }

    /**
     * Get patient from schedule event
     */
    public Patient getPatient() {
        return scheduleEvent != null ? scheduleEvent.getPatient() : null;
    }

    /**
     * Get staff who performs this service delivery
     * For unscheduled visits, returns the actual/replacement staff
     * For scheduled visits, returns the scheduled staff from ScheduleEvent
     */
    public Staff getStaff() {
        // If unscheduled visit, return the actual staff (replacement)
        if (Boolean.TRUE.equals(isUnscheduled) && actualStaff != null) {
            return actualStaff;
        }
        // For scheduled visits, return staff from schedule event
        return scheduleEvent != null ? scheduleEvent.getStaff() : null;
    }

    /**
     * Get the originally scheduled staff (from ScheduleEvent)
     * Useful for reporting when staff replacement occurs
     */
    public Staff getScheduledStaff() {
        return scheduleEvent != null ? scheduleEvent.getStaff() : null;
    }

    /**
     * Get check-in event
     */
    public CheckEvent getCheckInEvent() {
        return checkEvents.stream()
                .filter(CheckEvent::isCheckIn)
                .findFirst()
                .orElse(null);
    }

    /**
     * Get check-out event
     */
    public CheckEvent getCheckOutEvent() {
        return checkEvents.stream()
                .filter(CheckEvent::isCheckOut)
                .findFirst()
                .orElse(null);
    }

    /**
     * Check if check-in/check-out is completed
     */
    public boolean isCheckInCheckOutCompleted() {
        return getCheckInEvent() != null && getCheckOutEvent() != null;
    }

    /**
     * Check if both check-in and check-out are valid (within acceptable range)
     */
    public boolean isCheckInCheckOutFullyValid() {
        CheckEvent checkIn = getCheckInEvent();
        CheckEvent checkOut = getCheckOutEvent();
        return checkIn != null && checkIn.isOK() && 
               checkOut != null && checkOut.isOK();
    }

    /**
     * Add a check-in event
     */
    public void addCheckInEvent(CheckEvent checkEvent) {
        checkEvent.setServiceDelivery(this);
        checkEvent.setEventType(com.example.backend.model.enums.CheckEventType.CHECK_IN);
        this.checkEvents.add(checkEvent);
    }

    /**
     * Add a check-out event and calculate total hours
     */
    public void addCheckOutEvent(CheckEvent checkEvent) {
        checkEvent.setServiceDelivery(this);
        checkEvent.setEventType(com.example.backend.model.enums.CheckEventType.CHECK_OUT);
        this.checkEvents.add(checkEvent);
        
        // Calculate total hours
        CheckEvent checkIn = getCheckInEvent();
        if (checkIn != null && checkEvent.getOccurredAt() != null) {
            long seconds = java.time.Duration.between(
                checkIn.getOccurredAt(), 
                checkEvent.getOccurredAt()
            ).getSeconds();
            this.totalHours = seconds / 3600.0;
        }
    }

    /**
     * Get check-in time
     */
    public LocalDateTime getCheckInTime() {
        CheckEvent checkIn = getCheckInEvent();
        return checkIn != null ? checkIn.getOccurredAt() : null;
    }

    /**
     * Get check-out time
     */
    public LocalDateTime getCheckOutTime() {
        CheckEvent checkOut = getCheckOutEvent();
        return checkOut != null ? checkOut.getOccurredAt() : null;
    }

    /**
     * Check if check-in is valid
     */
    public boolean isCheckInValid() {
        CheckEvent checkIn = getCheckInEvent();
        return checkIn != null && checkIn.isOK();
    }

    /**
     * Check if check-out is valid
     */
    public boolean isCheckOutValid() {
        CheckEvent checkOut = getCheckOutEvent();
        return checkOut != null && checkOut.isOK();
    }

    /**
     * Cancel the service delivery
     */
    public void cancel(String reason, Staff cancelledBy) {
        this.cancelled = true;
        this.cancelReason = reason;
        this.cancelledAt = LocalDateTime.now();
        this.cancelledByStaff = cancelledBy;
        this.status = "cancelled";
    }

    /**
     * Check if service delivery is cancelled
     */
    public boolean isCancelled() {
        return Boolean.TRUE.equals(this.cancelled);
    }
}

