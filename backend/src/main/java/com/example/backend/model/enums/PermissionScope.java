package com.example.backend.model.enums;

/**
 * Permission scope levels
 */
public enum PermissionScope {
    ORG("org"),
    OFFICE("office"),
    SELF("self");

    private final String value;

    PermissionScope(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static PermissionScope fromValue(String value) {
        for (PermissionScope scope : PermissionScope.values()) {
            if (scope.value.equals(value)) {
                return scope;
            }
        }
        throw new IllegalArgumentException("Unknown permission scope: " + value);
    }
}

