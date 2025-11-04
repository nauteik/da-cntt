package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * ISP Goal entity for individual service plan goals
 */
@Entity
@Table(name = "isp_goal")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"isp"})
public class ISPGoal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_id", nullable = false)
    @JsonIgnore
    private ISP isp;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "measure")
    private String measure;

    @Column(name = "sort_order")
    private Integer sortOrder;

    public ISPGoal(ISP isp, String title) {
        this.isp = isp;
        this.title = title;
    }
}

