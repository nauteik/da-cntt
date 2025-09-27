package com.example.backend.model.entity;

import com.example.backend.model.enums.CheckEventStatus;
import com.example.backend.model.enums.CheckEventType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Check event entity for EVV check-in/check-out GPS tracking
 */
@Entity
@Table(name = "check_event")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "staff", "patient", "scheduleShift", "serviceDelivery", "exceptions"})
public class CheckEvent extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_shift_id")
    private ScheduleShift scheduleShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_delivery_id")
    private ServiceDelivery serviceDelivery;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private CheckEventType eventType;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(name = "accuracy_m", precision = 6, scale = 2)
    private BigDecimal accuracyM;

    @Column(name = "method", nullable = false)
    private String method = "mobile";

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CheckEventStatus status = CheckEventStatus.OK;

    // Relationships
    @OneToMany(mappedBy = "checkEvent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<CheckException> exceptions = new HashSet<>();

    public CheckEvent(Organization organization, Staff staff, CheckEventType eventType, LocalDateTime occurredAt) {
        this.organization = organization;
        this.staff = staff;
        this.eventType = eventType;
        this.occurredAt = occurredAt;
    }

    // Helper methods
    public boolean isCheckIn() {
        return CheckEventType.CHECK_IN.equals(eventType);
    }

    public boolean isCheckOut() {
        return CheckEventType.CHECK_OUT.equals(eventType);
    }

    public boolean isOK() {
        return CheckEventStatus.OK.equals(status);
    }

    public boolean hasGPSMismatch() {
        return CheckEventStatus.GPS_MISMATCH.equals(status);
    }

    public boolean hasTimeVariance() {
        return CheckEventStatus.TIME_VARIANCE.equals(status);
    }

    public boolean hasLocation() {
        return latitude != null && longitude != null;
    }

    public boolean isMobileMethod() {
        return "mobile".equals(method);
    }

    public boolean hasActiveException() {
        return exceptions.stream().anyMatch(ex -> "pending".equals(ex.getApprovalStatus()));
    }
}
