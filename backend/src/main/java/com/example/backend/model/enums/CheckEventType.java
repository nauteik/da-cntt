package com.example.backend.model.enums;

/**
 * Check-in/check-out event types for EVV
 */
public enum CheckEventType {
    CHECK_IN("check_in"),
    CHECK_OUT("check_out");

    private final String value;

    CheckEventType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static CheckEventType fromValue(String value) {
        for (CheckEventType type : CheckEventType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown check event type: " + value);
    }
}

