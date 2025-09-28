package com.example.backend.model.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Export job entity for tracking data exports to QuickBooks/CSV
 */
@Entity
@Table(name = "export_job")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"file", "createdByUser"})
public class ExportJob extends BaseEntity {

    @Column(name = "target", nullable = false)
    private String target;

    @Column(name = "status", nullable = false)
    private String status = "queued";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameters", columnDefinition = "jsonb")
    private Map<String, Object> parameters = new HashMap<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private FileObject file;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private AppUser createdByUser;

    public ExportJob(String target) {
        this.target = target;
    }

    // Helper methods
    public boolean isQueued() {
        return "queued".equals(status);
    }

    public boolean isProcessing() {
        return "processing".equals(status);
    }

    public boolean isCompleted() {
        return "completed".equals(status);
    }

    public boolean isFailed() {
        return "failed".equals(status);
    }

    public boolean isCancelled() {
        return "cancelled".equals(status);
    }

    public boolean isQuickBooksExport() {
        return "quickbooks".equals(target);
    }

    public boolean isCSVExport() {
        return "csv".equals(target);
    }

    public void markAsCompleted(FileObject resultFile) {
        this.status = "completed";
        this.file = resultFile;
        this.completedAt = LocalDateTime.now();
    }

    public void markAsFailed() {
        this.status = "failed";
        this.completedAt = LocalDateTime.now();
    }
}
