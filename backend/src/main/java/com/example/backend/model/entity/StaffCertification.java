package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;

/**
 * Staff certification entity for tracking mandatory certifications
 */
@Entity
@Table(name = "staff_certification")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"staff", "certificateFile"})
public class StaffCertification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @Column(name = "cert_type", nullable = false)
    private String certType;

    @Column(name = "issuer")
    private String issuer;

    @Column(name = "issued_at")
    private LocalDate issuedAt;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_file_id")
    private FileObject certificateFile;

    @Column(name = "status", nullable = false)
    private String status = "valid";

    public StaffCertification(Staff staff, String certType) {
        this.staff = staff;
        this.certType = certType;
    }

    // Helper methods
    public boolean isValid() {
        return "valid".equals(status);
    }

    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(LocalDate.now());
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

