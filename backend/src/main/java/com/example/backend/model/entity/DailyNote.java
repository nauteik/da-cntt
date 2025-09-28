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
import java.util.ArrayList;
import java.util.List;

/**
 * Daily note entity for post-shift reports with eSign support
 */
@Entity
@Table(name = "daily_note")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"serviceDelivery", "authorStaff", "attachmentFile"})
public class DailyNote extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_delivery_id", nullable = false)
    @JsonIgnore
    private ServiceDelivery serviceDelivery;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_staff_id", nullable = false)
    @JsonIgnore
    private Staff authorStaff;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "checklist", columnDefinition = "jsonb")
    private List<Object> checklist = new ArrayList<>();

    @Column(name = "patient_signed", nullable = false)
    private Boolean patientSigned = false;

    @Column(name = "patient_signer_name")
    private String patientSignerName;

    @Column(name = "patient_signed_at")
    private LocalDateTime patientSignedAt;

    @Column(name = "staff_signed", nullable = false)
    private Boolean staffSigned = false;

    @Column(name = "staff_signed_at")
    private LocalDateTime staffSignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attachment_file_id")
    private FileObject attachmentFile;

    public DailyNote(ServiceDelivery serviceDelivery, Staff authorStaff, String content) {
        this.serviceDelivery = serviceDelivery;
        this.authorStaff = authorStaff;
        this.content = content;
    }

    // Helper methods
    public boolean isPatientSigned() {
        return Boolean.TRUE.equals(patientSigned);
    }

    public boolean isStaffSigned() {
        return Boolean.TRUE.equals(staffSigned);
    }

    public boolean isFullySigned() {
        return isPatientSigned() && isStaffSigned();
    }

    public void signByPatient(String signerName) {
        this.patientSigned = true;
        this.patientSignerName = signerName;
        this.patientSignedAt = LocalDateTime.now();
    }

    public void signByStaff() {
        this.staffSigned = true;
        this.staffSignedAt = LocalDateTime.now();
    }

    public boolean hasAttachment() {
        return attachmentFile != null;
    }
}
