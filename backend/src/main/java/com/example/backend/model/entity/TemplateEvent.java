package com.example.backend.model.entity;


import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;

@Data
@Entity
@Table(name = "template_event", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"schedule_template_id", "weekday", "start_time"})
})
public class TemplateEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_template_id", nullable = false)
    private ScheduleTemplate scheduleTemplate;

    @Column(nullable = false)
    private Short weekday;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id")
    private ServiceType serviceType;

    @OneToMany(mappedBy = "templateEvent", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ISPTaskTemplate> ispTaskTemplates = new HashSet<>();

    @Column(name = "event_code")
    private String eventCode;

    @Column(name = "planned_units", nullable = false)
    private Integer plannedUnits;

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> meta;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
