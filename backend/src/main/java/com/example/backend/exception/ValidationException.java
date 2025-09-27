package com.example.backend.exception;

import com.example.backend.model.ErrorType;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when there's a validation error or business rule violation.
 * Maps to HTTP 400 Bad Request.
 */
public class ValidationException extends BaseException {

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, ErrorType.VALIDATION_ERROR);
    }

    public ValidationException(String message, Throwable cause) {
        super(message, cause, HttpStatus.BAD_REQUEST, ErrorType.VALIDATION_ERROR);
    }
}