package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * ISP (Individual Service Plan) entity
 */
@Entity
@Table(name = "isp", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "version_no"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patient", "file", "goals", "serviceAuthorizations", "progressReports"})
public class ISP extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patient patient;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Column(name = "effective_at", nullable = false)
    private LocalDate effectiveAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Column(name = "total_unit", precision = 10, scale = 2)
    private BigDecimal totalUnit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileObject file;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();

    // Relationships
    @OneToMany(mappedBy = "isp", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ISPGoal> goals = new HashSet<>();

    @OneToMany(mappedBy = "isp", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ServiceAuthorization> serviceAuthorizations = new HashSet<>();

    @OneToMany(mappedBy = "isp", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ProgressReport> progressReports = new HashSet<>();

    public ISP(Patient patient) {
        this.patient = patient;
    }

    // Helper methods
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDate.now());
    }

    public boolean isEffective() {
        LocalDate now = LocalDate.now();
        return !effectiveAt.isAfter(now) && (expiresAt == null || expiresAt.isAfter(now));
    }

    public boolean isExpiringSoon(int daysWarning) {
        if (expiresAt == null) return false;
        return expiresAt.isBefore(LocalDate.now().plusDays(daysWarning));
    }

    public long getDaysUntilExpiry() {
        if (expiresAt == null) return Long.MAX_VALUE;
        return LocalDate.now().until(expiresAt).getDays();
    }
}

