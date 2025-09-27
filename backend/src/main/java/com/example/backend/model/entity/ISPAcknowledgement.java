package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * ISP acknowledgement entity for tracking staff ISP reading compliance
 */
@Entity
@Table(name = "isp_acknowledgement", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"isp_version_id", "staff_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"ispVersion", "staff"})
public class ISPAcknowledgement extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_version_id", nullable = false)
    @JsonIgnore
    private ISPVersion ispVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @Column(name = "acknowledged_at", nullable = false)
    private LocalDateTime acknowledgedAt = LocalDateTime.now();

    public ISPAcknowledgement(ISPVersion ispVersion, Staff staff) {
        this.ispVersion = ispVersion;
        this.staff = staff;
    }

    // Helper methods
    public boolean isRecentlyAcknowledged(int daysThreshold) {
        return acknowledgedAt.isAfter(LocalDateTime.now().minusDays(daysThreshold));
    }
}

