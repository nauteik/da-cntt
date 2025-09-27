package com.example.backend.model;

/**
 * Enum defining different types of errors for better client-side handling.
 * Helps frontend decide how to display errors to users.
 */
public enum ErrorType {
    // Show to user - safe to display
    VALIDATION_ERROR,      // "Email is required"
    BUSINESS_ERROR,        // "Cannot delete user with active orders"
    NOT_FOUND,            // "User not found"
    CONFLICT,             // "Email already exists"
    AUTHENTICATION_ERROR, // "Please log in again"
    PERMISSION_ERROR,      // "You don't have permission"
    
    // Generic message - don't show details (raw error) to user
    SYSTEM_ERROR         // "Something went wrong, please try again"
}