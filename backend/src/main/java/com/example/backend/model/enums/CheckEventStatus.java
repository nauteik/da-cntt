package com.example.backend.model.enums;

/**
 * Check event validation status
 */
public enum CheckEventStatus {
    OK("ok"),
    GPS_MISMATCH("gps_mismatch"),
    TIME_VARIANCE("time_variance"),
    EXCEPTION_REQUESTED("exception_requested"),
    EXCEPTION_APPROVED("exception_approved");

    private final String value;

    CheckEventStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static CheckEventStatus fromValue(String value) {
        for (CheckEventStatus status : CheckEventStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown check event status: " + value);
    }
}

