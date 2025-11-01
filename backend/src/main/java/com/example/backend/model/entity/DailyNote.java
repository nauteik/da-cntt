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

    // Check-in / Check-out times and locations with GPS validation
    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_in_latitude")
    private Double checkInLatitude;

    @Column(name = "check_in_longitude")
    private Double checkInLongitude;

    @Column(name = "check_in_location")
    private String checkInLocation;

    @Column(name = "check_in_distance_meters")
    private Double checkInDistanceMeters;

    @Column(name = "check_in_valid")
    private Boolean checkInValid;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "check_out_latitude")
    private Double checkOutLatitude;

    @Column(name = "check_out_longitude")
    private Double checkOutLongitude;

    @Column(name = "check_out_location")
    private String checkOutLocation;

    @Column(name = "check_out_distance_meters")
    private Double checkOutDistanceMeters;

    @Column(name = "check_out_valid")
    private Boolean checkOutValid;

    @Column(name = "total_hours")
    private Double totalHours;

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

    /**
     * Check if check-in/check-out is completed
     */
    public boolean isCheckInCheckOutCompleted() {
        return checkInTime != null && checkOutTime != null;
    }

    /**
     * Check if both check-in and check-out are valid (within 1km)
     */
    public boolean isCheckInCheckOutFullyValid() {
        return Boolean.TRUE.equals(checkInValid) && Boolean.TRUE.equals(checkOutValid);
    }

    /**
     * Process check-out and calculate total hours
     * @param checkOutTime Check-out time
     * @param latitude Check-out latitude
     * @param longitude Check-out longitude
     * @param address Check-out address
     * @param distanceMeters Distance from patient address in meters
     * @param isValid Whether check-out is within valid range (1km)
     */
    public void checkOut(LocalDateTime checkOutTime, Double latitude, Double longitude, 
                        String address, Double distanceMeters, Boolean isValid) {
        this.checkOutTime = checkOutTime;
        this.checkOutLatitude = latitude;
        this.checkOutLongitude = longitude;
        this.checkOutLocation = address;
        this.checkOutDistanceMeters = distanceMeters;
        this.checkOutValid = isValid;
        
        // Calculate total hours if check-in time exists
        if (this.checkInTime != null && checkOutTime != null) {
            long seconds = java.time.Duration.between(this.checkInTime, checkOutTime).getSeconds();
            this.totalHours = seconds / 3600.0;
        }
    }

    /**
     * Get formatted distance for check-in
     */
    public String getCheckInDistanceFormatted() {
        if (checkInDistanceMeters == null) return "N/A";
        if (checkInDistanceMeters < 1000) {
            return String.format("%.0f m", checkInDistanceMeters);
        }
        return String.format("%.2f km", checkInDistanceMeters / 1000.0);
    }

    /**
     * Get formatted distance for check-out
     */
    public String getCheckOutDistanceFormatted() {
        if (checkOutDistanceMeters == null) return "N/A";
        if (checkOutDistanceMeters < 1000) {
            return String.format("%.0f m", checkOutDistanceMeters);
        }
        return String.format("%.2f km", checkOutDistanceMeters / 1000.0);
    }
}
