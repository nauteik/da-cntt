package com.example.backend.exception;

import com.example.backend.model.ErrorType;
import org.springframework.http.HttpStatus;

/**
 * Exception thrown when there's an internal server error or unexpected condition.
 * Maps to HTTP 500 Internal Server Error.
 */
public class BusinessException extends BaseException {

    public BusinessException(String message) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, ErrorType.BUSINESS_ERROR);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause, HttpStatus.INTERNAL_SERVER_ERROR, ErrorType.BUSINESS_ERROR);
    }
}