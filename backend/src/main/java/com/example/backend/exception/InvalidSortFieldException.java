package com.example.backend.exception;

import com.example.backend.model.ErrorType;
import org.springframework.http.HttpStatus;

import java.util.Set;

/**
 * Exception thrown when an invalid sort field is provided.
 * This prevents SQL injection and ensures only whitelisted fields can be used for sorting.
 */
public class InvalidSortFieldException extends BaseException {

    public InvalidSortFieldException(String field, Set<String> allowedFields) {
        super(
            String.format("Invalid sort field: '%s'. Allowed fields: %s", field, allowedFields),
            HttpStatus.BAD_REQUEST,
            ErrorType.VALIDATION_ERROR
        );
    }
}
