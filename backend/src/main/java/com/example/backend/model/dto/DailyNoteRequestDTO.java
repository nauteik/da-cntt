package com.example.backend.model.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public class DailyNoteRequestDTO {

    @NotNull
    private UUID serviceDeliveryId;

    @NotNull
    private String content;

    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private String checkInLocation;
    private String checkOutLocation;

    // mealInfo can be a list of maps or objects - keep generic
    private List<Object> mealInfo;

    private String patientSignature;
    private String staffSignature;

    private Boolean cancelled;
    private String cancelReason;

    // getters and setters
    public UUID getServiceDeliveryId() { return serviceDeliveryId; }
    public void setServiceDeliveryId(UUID serviceDeliveryId) { this.serviceDeliveryId = serviceDeliveryId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }
    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime checkOutTime) { this.checkOutTime = checkOutTime; }
    public String getCheckInLocation() { return checkInLocation; }
    public void setCheckInLocation(String checkInLocation) { this.checkInLocation = checkInLocation; }
    public String getCheckOutLocation() { return checkOutLocation; }
    public void setCheckOutLocation(String checkOutLocation) { this.checkOutLocation = checkOutLocation; }
    public List<Object> getMealInfo() { return mealInfo; }
    public void setMealInfo(List<Object> mealInfo) { this.mealInfo = mealInfo; }
    public String getPatientSignature() { return patientSignature; }
    public void setPatientSignature(String patientSignature) { this.patientSignature = patientSignature; }
    public String getStaffSignature() { return staffSignature; }
    public void setStaffSignature(String staffSignature) { this.staffSignature = staffSignature; }
    public Boolean getCancelled() { return cancelled; }
    public void setCancelled(Boolean cancelled) { this.cancelled = cancelled; }
    public String getCancelReason() { return cancelReason; }
    public void setCancelReason(String cancelReason) { this.cancelReason = cancelReason; }
}
