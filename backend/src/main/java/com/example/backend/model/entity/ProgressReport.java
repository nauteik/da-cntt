package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Progress report entity for periodic reports serving AE/DHS audit
 */
@Entity
@Table(name = "progress_report")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"isp","file"})
public class ProgressReport extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_id", nullable = false)
    @JsonIgnore
    private ISP isp;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "summary", columnDefinition = "jsonb")
    private Map<String, Object> summary = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileObject file;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    public ProgressReport(ISP isp, LocalDate periodStart, LocalDate periodEnd) {
        this.isp = isp;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
    }

    // Helper methods
    public long getReportPeriodDays() {
        return periodStart.until(periodEnd).getDays();
    }

    public boolean isQuarterlyReport() {
        return getReportPeriodDays() >= 80 && getReportPeriodDays() <= 100; // Approximately 3 months
    }

    public boolean isMonthlyReport() {
        return getReportPeriodDays() >= 28 && getReportPeriodDays() <= 35; // Approximately 1 month
    }
}

