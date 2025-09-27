package com.example.backend.model.enums;

/**
 * Types of payors (insurance providers)
 */
public enum PayorType {
    MEDICAID("Medicaid"),
    MEDICARE("Medicare"),
    PRIVATE_PAY("Private Pay"),
    INSURANCE("Insurance"),
    OTHER("Other");

    private final String value;

    PayorType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PayorType fromValue(String value) {
        for (PayorType type : PayorType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown payor type: " + value);
    }
}

