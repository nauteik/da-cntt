package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
 * Document version entity for staff document versioning
 */
@Entity
@Table(name = "document_version", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"staff_document_id", "version_no"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"staffDocument", "file", "signer"})
public class DocumentVersion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_document_id", nullable = false)
    @JsonIgnore
    private StaffDocument staffDocument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private FileObject file;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo;

    @Column(name = "checksum")
    private String checksum;

    @Column(name = "signed", nullable = false)
    private Boolean signed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signer_id")
    private AppUser signer;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @Column(name = "effective_at")
    private LocalDateTime effectiveAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta = new HashMap<>();

    public DocumentVersion(StaffDocument staffDocument, FileObject file, Integer versionNo) {
        this.staffDocument = staffDocument;
        this.file = file;
        this.versionNo = versionNo;
    }

    // Helper methods
    public boolean isSigned() {
        return Boolean.TRUE.equals(signed);
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
    }

    public boolean isEffective() {
        LocalDateTime now = LocalDateTime.now();
        return (effectiveAt == null || effectiveAt.isBefore(now)) &&
               (expiresAt == null || expiresAt.isAfter(now));
    }

    public void signDocument(AppUser signer) {
        this.signed = true;
        this.signer = signer;
        this.signedAt = LocalDateTime.now();
    }
}

