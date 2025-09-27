package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard API response wrapper for all REST endpoints.
 * Provides consistent structure for both success and error responses.
 * 
 * @param <T> the type of data being returned
 */
@Getter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    @JsonProperty("success")
    private boolean success;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("data")
    private T data;
    
    @JsonProperty("errors")
    private List<String> errors;
    
    @JsonProperty("timestamp")
    private LocalDateTime timestamp;
    
    @JsonProperty("path")
    @Setter
    private String path;
    
    @JsonProperty("status")
    private int status;

    @JsonProperty("errorType")
    private ErrorType errorType;

    private ApiResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = true;
        response.data = data;
        response.message = message;
        response.status = 200;
        return response;
    }

    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    public static ApiResponse<Void> success(String message) {
        return success(null, message);
    }

    public static ApiResponse<Void> success() {
        return success("Operation completed successfully");
    }

    /**
     * Creates an error response with single error message and ErrorType
     */
    public static <T> ApiResponse<T> error(String message, int status, String path, ErrorType errorType) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = message;
        response.status = status;
        response.path = path;
        response.errors = List.of(message);
        response.errorType = errorType;
        return response;
    }

    /**
     * Creates an error response with multiple error messages (for validation)
     */
    public static <T> ApiResponse<T> error(List<String> errors, int status, String path, ErrorType errorType) {
        ApiResponse<T> response = new ApiResponse<>();
        response.success = false;
        response.message = errors.size() == 1 ? errors.get(0) : "Multiple validation errors";
        response.errors = errors;
        response.status = status;
        response.path = path;
        response.errorType = errorType;
        return response;
    }

    // Custom getter for success field to follow naming convention
    public boolean isSuccess() {
        return success;
    }
}