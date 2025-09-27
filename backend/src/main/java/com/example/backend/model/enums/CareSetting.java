package com.example.backend.model.enums;

/**
 * Care setting types for service types
 */
public enum CareSetting {
    RESIDENTIAL("residential"),
    NON_RESIDENTIAL("non_residential");

    private final String value;

    CareSetting(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static CareSetting fromValue(String value) {
        for (CareSetting setting : CareSetting.values()) {
            if (setting.value.equals(value)) {
                return setting;
            }
        }
        throw new IllegalArgumentException("Unknown care setting: " + value);
    }
}

