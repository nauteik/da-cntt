package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Fire drill entity for fire drill compliance (PA Code 6400)
 */
@Entity
@Table(name = "fire_drill")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "office", "reportFile", "createdBy", "participants", "issues"})
public class FireDrill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    @Column(name = "drill_date", nullable = false)
    private LocalDate drillDate;

    @Column(name = "drill_time", nullable = false)
    private LocalTime drillTime;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "session_type", nullable = false)
    private String sessionType;

    @Column(name = "evacuation_time_sec", nullable = false)
    private Integer evacuationTimeSec;

    @Column(name = "participants_count", nullable = false)
    private Integer participantsCount = 0;

    @Column(name = "exit_type")
    private String exitType;

    @Column(name = "status", nullable = false)
    private String status = "scheduled";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_file_id")
    private FileObject reportFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdBy;

    // Relationships
    @OneToMany(mappedBy = "fireDrill", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<FireDrillParticipant> participants = new HashSet<>();

    @OneToMany(mappedBy = "fireDrill", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<FireDrillIssue> issues = new HashSet<>();

    public FireDrill(Organization organization, LocalDate drillDate, LocalTime drillTime, 
                    String location, String sessionType, Integer evacuationTimeSec) {
        this.organization = organization;
        this.drillDate = drillDate;
        this.drillTime = drillTime;
        this.location = location;
        this.sessionType = sessionType;
        this.evacuationTimeSec = evacuationTimeSec;
    }

    // Helper methods
    public boolean isScheduled() {
        return "scheduled".equals(status);
    }

    public boolean isCompleted() {
        return "completed".equals(status);
    }

    public boolean isCancelled() {
        return "cancelled".equals(status);
    }

    public boolean isAnnounced() {
        return "announced".equals(sessionType);
    }

    public boolean isUnannounced() {
        return "unannounced".equals(sessionType);
    }

    public boolean meetsEvacuationTimeRequirement(int maxSeconds) {
        return evacuationTimeSec <= maxSeconds;
    }

    public boolean hasIssues() {
        return !issues.isEmpty();
    }

    public boolean hasReport() {
        return reportFile != null;
    }

    public long getEvacuationTimeMinutes() {
        return evacuationTimeSec / 60;
    }

    public void complete() {
        this.status = "completed";
        this.participantsCount = participants.size();
    }
}
