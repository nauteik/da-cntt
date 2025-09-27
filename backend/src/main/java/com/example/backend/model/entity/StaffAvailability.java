package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalTime;

/**
 * Staff availability entity for scheduling data source
 */
@Entity
@Table(name = "staff_availability")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"staff"})
public class StaffAvailability extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @Column(name = "weekday", nullable = false)
    private Short weekday; // 0 = Sunday, 6 = Saturday

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "note")
    private String note;

    @Column(name = "repeats", nullable = false)
    private Boolean repeats = true;

    public StaffAvailability(Staff staff, Short weekday, LocalTime startTime, LocalTime endTime) {
        this.staff = staff;
        this.weekday = weekday;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    // Helper methods
    public String getWeekdayName() {
        String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        return weekday >= 0 && weekday < days.length ? days[weekday] : "Unknown";
    }

    public boolean isValidTimeRange() {
        return endTime.isAfter(startTime);
    }

    public long getDurationMinutes() {
        if (!isValidTimeRange()) return 0;
        return startTime.until(endTime, java.time.temporal.ChronoUnit.MINUTES);
    }

    public boolean isAvailableAt(LocalTime time) {
        return !time.isBefore(startTime) && time.isBefore(endTime);
    }
}

