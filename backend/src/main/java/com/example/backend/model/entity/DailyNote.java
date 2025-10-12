package com.example.backend.model.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

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

    // Link to patient and staff responsible for the note (explicit IDs via relation)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id")
    private Staff staff; // the caregiver related to this note (could be same as authorStaff)

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "checklist", columnDefinition = "jsonb")
    private List<Object> checklist = new ArrayList<>();

    // Check-in / Check-out times and locations
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "check_in_location")
    private String checkInLocation;

    @Column(name = "check_out_location")
    private String checkOutLocation;

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

    // Meal information stored as JSONB. Suggested structure:
    // { "morning": {"time":"08:30","ate":"eggs","offered":"cereal"}, "lunch": {...}, "afternoon": {...} }
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "meal_info", columnDefinition = "jsonb")
    private List<Object> mealInfo = new ArrayList<>();

    @Column(name = "patient_signature")
    private String patientSignature; // could store signer name or base64 signature reference

    @Column(name = "staff_signature")
    private String staffSignature; // staff signature (name or reference)

    @Column(name = "cancelled", nullable = false)
    private Boolean cancelled = false;

    @Column(name = "cancel_reason")
    private String cancelReason;

    public DailyNote(ServiceDelivery serviceDelivery, Staff authorStaff, String content) {
        this.serviceDelivery = serviceDelivery;
        this.authorStaff = authorStaff;
        this.content = content;
    }

    public DailyNote(ServiceDelivery serviceDelivery, Staff authorStaff, Patient patient, String content) {
        this.serviceDelivery = serviceDelivery;
        this.authorStaff = authorStaff;
        this.patient = patient;
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
