package com.example.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Permission scope levels
 */
public enum PermissionScope {
    SELF("self"),
    OFFICE("office"),
    ORG("org");

    private final String value;

    PermissionScope(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}

