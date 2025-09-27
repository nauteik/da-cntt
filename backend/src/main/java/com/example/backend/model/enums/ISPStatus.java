package com.example.backend.model.enums;

/**
 * ISP (Individual Service Plan) status
 */
public enum ISPStatus {
    DRAFT("draft"),
    ACTIVE("active"),
    EXPIRED("expired"),
    ARCHIVED("archived");

    private final String value;

    ISPStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ISPStatus fromValue(String value) {
        for (ISPStatus status : ISPStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown ISP status: " + value);
    }
}

