package com.example.backend.model.enums;

/**
 * Claim processing status
 */
public enum ClaimStatus {
    DRAFT("draft"),
    SUBMITTED("submitted"),
    PENDING("pending"),
    APPROVED("approved"),
    DENIED("denied"),
    PAID("paid");

    private final String value;

    ClaimStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ClaimStatus fromValue(String value) {
        for (ClaimStatus status : ClaimStatus.values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown claim status: " + value);
    }
}

