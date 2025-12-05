package com.example.backend.model.entity;


import com.example.backend.model.enums.ScheduleEventStatus;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "schedule_event")
public class ScheduleEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "event_date", nullable = false)
    private LocalDate eventDate;

    @Column(name = "start_at", nullable = false)
    private OffsetDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private OffsetDateTime endAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "authorization_id")
    private Authorization authorization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(name = "event_code")
    private String eventCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ScheduleEventStatus status = ScheduleEventStatus.PLANNED;

    @Column(name = "planned_units", nullable = false)
    private Integer plannedUnits;

    @Column(name = "actual_units")
    private Integer actualUnits;

    @Column(name = "comment", columnDefinition = "text")
    private String comment;

    @Type(JsonBinaryType.class)
    @Column(name = "unit_summary", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> unitSummary = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_template_id")
    private ScheduleTemplate sourceTemplate;

    @Column(name = "generated_at")
    private OffsetDateTime generatedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;
}
