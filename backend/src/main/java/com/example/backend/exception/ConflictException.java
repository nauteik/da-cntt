package com.example.backend.exception;

import com.example.backend.model.ErrorType;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when there's a conflict with the current state of the resource.
 * Maps to HTTP 409 Conflict.
 */
public class ConflictException extends BaseException {

    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT, ErrorType.CONFLICT);
    }

    public ConflictException(String message, Throwable cause) {
        super(message, cause, HttpStatus.CONFLICT, ErrorType.CONFLICT);
    }
}