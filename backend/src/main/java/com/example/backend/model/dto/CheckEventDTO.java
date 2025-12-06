package com.example.backend.model.dto;

import java.time.LocalDateTime;

import com.example.backend.model.enums.CheckEventStatus;
import com.example.backend.model.enums.CheckEventType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Check Event (Check-in/Check-out) with GPS tracking information
 * Used in Visit Maintenance to display employee location vs client address
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckEventDTO {
    
    /**
     * Event timestamp (check-in or check-out time)
     */
    private LocalDateTime timestamp;
    
    /**
     * Event type: CHECK_IN or CHECK_OUT
     */
    private CheckEventType eventType;
    
    /**
     * GPS Latitude coordinate
     */
    private Double latitude;
    
    /**
     * GPS Longitude coordinate
     */
    private Double longitude;
    
    /**
     * GPS accuracy in meters
     */
    private Double accuracyMeters;
    
    /**
     * GPS collection method (e.g., "mobile", "manual")
     */
    private String method;
    
    /**
     * Check event status: OK, GPS_MISMATCH, TIME_VARIANCE
     */
    private CheckEventStatus status;
    
    /**
     * Flag indicating if GPS coordinates are available
     */
    public boolean hasGPS() {
        return latitude != null && longitude != null;
    }
    
    /**
     * Flag indicating if there is a GPS mismatch (employee too far from client address)
     */
    public boolean hasGPSException() {
        return status == CheckEventStatus.GPS_MISMATCH;
    }
    
    /**
     * Flag indicating if this is a check-in event
     */
    public boolean isCheckIn() {
        return eventType == CheckEventType.CHECK_IN;
    }
    
    /**
     * Flag indicating if this is a check-out event
     */
    public boolean isCheckOut() {
        return eventType == CheckEventType.CHECK_OUT;
    }
}
