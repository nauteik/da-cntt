package com.example.backend.model.enums;

/**
 * Types of payers (insurance providers)
 */
public enum PayerType {
    MEDICAID("Medicaid"),
    MEDICARE("Medicare"),
    PRIVATE_PAY("Private Pay"),
    INSURANCE("Insurance"),
    OTHER("Other");

    private final String value;

    PayerType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PayerType fromValue(String value) {
        for (PayerType type : PayerType.values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown payer type: " + value);
    }
}

