package com.example.backend.exception;

import com.example.backend.model.ErrorType;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested resource is not found.
 * Maps to HTTP 404 Not Found.
 */
public class ResourceNotFoundException extends BaseException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, ErrorType.NOT_FOUND);
    }

    public ResourceNotFoundException(String resourceType, Object id) {
        super(String.format("%s with id '%s' not found", resourceType, id), HttpStatus.NOT_FOUND, ErrorType.NOT_FOUND);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause, HttpStatus.NOT_FOUND, ErrorType.NOT_FOUND);
    }
}