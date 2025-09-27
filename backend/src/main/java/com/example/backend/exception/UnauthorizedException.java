package com.example.backend.exception;

import com.example.backend.model.ErrorType;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a user is not authorized to perform an action.
 * Maps to HTTP 403 Forbidden.
 */
public class UnauthorizedException extends BaseException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.FORBIDDEN, ErrorType.PERMISSION_ERROR);
    }

    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause, HttpStatus.FORBIDDEN, ErrorType.PERMISSION_ERROR);
    }
}