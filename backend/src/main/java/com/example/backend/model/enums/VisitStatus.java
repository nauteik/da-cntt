package com.example.backend.model.enums;

/**
 * Visit Status Enum for tracking the lifecycle of a service delivery visit
 */
public enum VisitStatus {
    /**
     * Visit is scheduled but hasn't started yet (no check-in)
     */
    NOT_STARTED("Not Started"),
    
    /**
     * Visit has check-in but no check-out yet (still ongoing)
     */
    IN_PROGRESS("In Progress"),
    
    /**
     * Visit has both check-in and check-out completed
     */
    COMPLETED("Completed"),
    
    /**
     * Visit has check-in but no check-out, and the scheduled time has passed
     * This indicates employee forgot to check out or technical issues
     */
    INCOMPLETE("Incomplete"),
    
    /**
     * Visit has been verified and approved for billing
     * Both check-in and check-out are present and validated
     */
    VERIFIED("Verified"),
    
    /**
     * Visit is cancelled (Do Not Bill is checked)
     * Reason: patient declined service, hospitalized, etc.
     */
    CANCELLED("Cancelled");

    private final String displayName;

    VisitStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Determine visit status based on check-in/out times and schedule
     */
    public static VisitStatus determineStatus(
        java.time.LocalDateTime checkInTime,
        java.time.LocalDateTime checkOutTime,
        java.time.LocalDateTime scheduledEndTime,
        boolean isCancelled,
        boolean isVerified
    ) {
        if (isCancelled) {
            return CANCELLED;
        }
        
        if (isVerified && checkInTime != null && checkOutTime != null) {
            return VERIFIED;
        }
        
        if (checkInTime == null) {
            return NOT_STARTED;
        }
        
        if (checkOutTime == null) {
            // Check if scheduled time has passed
            if (java.time.LocalDateTime.now().isAfter(scheduledEndTime)) {
                return INCOMPLETE;
            }
            return IN_PROGRESS;
        }
        
        return COMPLETED;
    }
}
