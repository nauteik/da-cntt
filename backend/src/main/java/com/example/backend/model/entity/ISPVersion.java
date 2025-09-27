package com.example.backend.model.entity;

import com.example.backend.model.enums.ISPStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * ISP version entity for version control and expiry management
 */
@Entity
@Table(name = "isp_version", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"isp_id", "version_no"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"isp", "organization", "file", "goals", "serviceAuthorizations", "acknowledgements"})
public class ISPVersion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_id", nullable = false)
    @JsonIgnore
    private ISP isp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Column(name = "effective_at", nullable = false)
    private LocalDate effectiveAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ISPStatus status = ISPStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileObject file;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();

    // Relationships
    @OneToMany(mappedBy = "ispVersion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ISPGoal> goals = new HashSet<>();

    @OneToMany(mappedBy = "ispVersion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ServiceAuthorization> serviceAuthorizations = new HashSet<>();

    @OneToMany(mappedBy = "ispVersion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ISPAcknowledgement> acknowledgements = new HashSet<>();

    @OneToMany(mappedBy = "ispVersion", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ProgressReport> progressReports = new HashSet<>();

    public ISPVersion(ISP isp, Organization organization, Integer versionNo, LocalDate effectiveAt) {
        this.isp = isp;
        this.organization = organization;
        this.versionNo = versionNo;
        this.effectiveAt = effectiveAt;
    }

    // Helper methods
    public boolean isDraft() {
        return ISPStatus.DRAFT.equals(status);
    }

    public boolean isActive() {
        return ISPStatus.ACTIVE.equals(status);
    }

    public boolean isExpired() {
        return ISPStatus.EXPIRED.equals(status) || 
               (expiresAt != null && expiresAt.isBefore(LocalDate.now()));
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

