package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * ISP Goal entity for individual service plan goals
 */
@Entity
@Table(name = "isp_goal")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"isp", "serviceAuthorization", "tasks"})
public class ISPGoal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_id", nullable = false)
    @JsonIgnore
    private ISP isp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_authorization_id")
    private ServiceAuthorization serviceAuthorization;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "measure")
    private String measure;

    @Column(name = "sort_order")
    private Integer sortOrder;

    // Relationships
    @OneToMany(mappedBy = "ispGoal", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ISPTask> tasks = new HashSet<>();

    public ISPGoal(ISP isp, String title) {
        this.isp = isp;
        this.title = title;
    }

    // Helper methods
    public void addTask(ISPTask task) {
        tasks.add(task);
        task.setIspGoal(this);
    }

    public void removeTask(ISPTask task) {
        tasks.remove(task);
        task.setIspGoal(null);
    }
}

