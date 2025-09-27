package com.example.backend.exception;

import com.example.backend.model.ErrorType;
import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Base class for all custom business exceptions in the application.
 * Provides a consistent structure for exception handling.
 */
@Getter
public abstract class BaseException extends RuntimeException {
    
    private final HttpStatus httpStatus;
    private final ErrorType errorType;

    protected BaseException(String message, HttpStatus httpStatus, ErrorType errorType) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorType = errorType;
    }

    protected BaseException(String message, Throwable cause, HttpStatus httpStatus, ErrorType errorType) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.errorType = errorType;
    }
}