package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * PRN rule entity for PRN medication conditions
 */
@Entity
@Table(name = "prn_rule")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"medicationOrder"})
public class PRNRule extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_order_id", nullable = false)
    @JsonIgnore
    private MedicationOrder medicationOrder;

    @Column(name = "conditions")
    private String conditions;

    @Column(name = "follow_up")
    private String followUp;

    @Column(name = "max_per_day")
    private Integer maxPerDay;

    @Column(name = "min_interval_minutes")
    private Integer minIntervalMinutes;

    public PRNRule(MedicationOrder medicationOrder, String conditions) {
        this.medicationOrder = medicationOrder;
        this.conditions = conditions;
    }

    // Helper methods
    public boolean hasMaxPerDayLimit() {
        return maxPerDay != null && maxPerDay > 0;
    }

    public boolean hasMinIntervalLimit() {
        return minIntervalMinutes != null && minIntervalMinutes > 0;
    }
}

