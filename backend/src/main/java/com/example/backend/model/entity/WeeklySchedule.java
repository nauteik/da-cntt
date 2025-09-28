package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Weekly schedule entity for patient weekly schedules
 */
@Entity
@Table(name = "weekly_schedule", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "week_start"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"office", "patient", "ispVersion", "shifts"})
public class WeeklySchedule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    @JsonIgnore
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_version_id")
    private ISPVersion ispVersion;

    @Column(name = "week_start", nullable = false)
    private LocalDate weekStart;

    @Column(name = "status", nullable = false)
    private String status = "draft";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "unit_summary", columnDefinition = "jsonb")
    private Map<String, Object> unitSummary = new HashMap<>();

    @Column(name = "created_by")
    private UUID createdBy;

    // Relationships
    @OneToMany(mappedBy = "weeklySchedule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ScheduleShift> shifts = new HashSet<>();

    public WeeklySchedule(Office office, Patient patient, LocalDate weekStart) {
        this.office = office;
        this.patient = patient;
        this.weekStart = weekStart;
    }

    // Helper methods
    public boolean isDraft() {
        return "draft".equals(status);
    }

    public boolean isPublished() {
        return "published".equals(status);
    }

    public boolean isApproved() {
        return "approved".equals(status);
    }

    public LocalDate getWeekEnd() {
        return weekStart.plusDays(6);
    }

    public boolean isCurrentWeek() {
        LocalDate now = LocalDate.now();
        return !weekStart.isAfter(now) && !getWeekEnd().isBefore(now);
    }

    public int getTotalPlannedUnits() {
        return shifts.stream()
                .mapToInt(ScheduleShift::getPlannedUnits)
                .sum();
    }
}

