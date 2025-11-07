package com.example.backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "schedule_template_week", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"template_id", "week_index"})
})
public class ScheduleTemplateWeek {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ScheduleTemplate template;

    @Column(name = "week_index", nullable = false)
    private Integer weekIndex;

    @Column(name = "name")
    private String name;

    @OneToMany(mappedBy = "templateWeek", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<ScheduleTemplateEvent> events = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}


