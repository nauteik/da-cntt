package com.example.backend.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enumeration of patient genders.
 * Uses display values "Male" and "Female" for database storage and API presentation.
 */
@Getter
@RequiredArgsConstructor
public enum Gender {
    MALE("Male"),
    FEMALE("Female");

    private final String label;
    
    /**
     * Find a Gender enum value from its display string value.
     * Case-insensitive matching.
     * 
     * @param value The string value to match
     * @return The matched Gender enum, or null if no match
     */
    @JsonCreator
    public static Gender fromLabel(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        
        String normalized = value.trim();
        
        for (Gender gender : Gender.values()) {
            if (gender.getLabel().equalsIgnoreCase(normalized)) {
                return gender;
            }
        }
        
        throw new IllegalArgumentException("Invalid gender value: " + value + 
            ". Must be one of: Male, Female");
    }
    
    /**
     * Returns the label value for serialization.
     * This ensures the enum is serialized as "Male" or "Female" in JSON.
     * 
     * @return The label value for this gender
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