package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * ISP Task entity for tasks within ISP goals
 */
@Entity
@Table(name = "isp_task")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"ispGoal"})
public class ISPTask extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_goal_id", nullable = false)
    @JsonIgnore
    private ISPGoal ispGoal;

    @Column(name = "task", nullable = false)
    private String task;

    @Column(name = "frequency")
    private String frequency;

    @Column(name = "required", nullable = false)
    private Boolean required = true;

    @Column(name = "sort_order")
    private Integer sortOrder;

    public ISPTask(ISPGoal ispGoal, String task) {
        this.ispGoal = ispGoal;
        this.task = task;
    }

    // Helper methods
    public boolean isRequired() {
        return Boolean.TRUE.equals(required);
    }
}

