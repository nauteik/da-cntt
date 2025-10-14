package com.example.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enumeration of address types.
 * Uses display values for database storage and API presentation.
 */
@Getter
@RequiredArgsConstructor
public enum AddressType {
    HOME("Home"),
    COMMUNITY("Community"),
    SENIOR("Senior"),
    BUSINESS("Business");

    private final String label;
    
    /**
     * Find an AddressType enum value from its display string value.
     * Case-insensitive matching.
     * 
     * @param value The string value to match
     * @return The matched AddressType enum, or null if no match
     */
    @JsonCreator
    public static AddressType fromLabel(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        String normalized = value.trim();
        
        for (AddressType type : AddressType.values()) {
            if (type.getLabel().equalsIgnoreCase(normalized)) {
                return type;
            }
        }
        
        throw new IllegalArgumentException("Invalid address type value: " + value + 
            ". Must be one of: Home, Community, Senior, Business");
    }
    
    /**
     * Returns the label value for serialization.
     * This ensures the enum is serialized as "Home", "Community", etc. in JSON.
     * 
     * @return The label value for this address type
     */
    @JsonValue
    public String toValue() {
        return label;
    }
    
    @Override
    public String toString() {
        return label;
    }
}
