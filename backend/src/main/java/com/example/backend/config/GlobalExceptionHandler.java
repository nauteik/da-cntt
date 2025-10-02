package com.example.backend.config;

import com.example.backend.exception.*;
import com.example.backend.model.ApiResponse;
import com.example.backend.model.ErrorType;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.ArrayList;
import java.util.List;

/**
 * Global exception handler that catches all exceptions thrown in the application
 * and converts them to standardized ApiResponse format.
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiResponse<Void>> handleBaseException(BaseException ex, HttpServletRequest request) {
        logger.error("Business exception occurred: {} at {}", ex.getMessage(), request.getRequestURI(), ex);
        
        ApiResponse<Void> response = ApiResponse.error(
            ex.getMessage(),
            ex.getHttpStatus().value(),
            request.getRequestURI(),
            ex.getErrorType()
        );
        
        return new ResponseEntity<>(response, ex.getHttpStatus());
    }

    /**
     * Handles Bean Validation errors from @Valid annotations.
     * Converts field-level validation errors into user-friendly messages.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationExceptions(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        logger.warn("Validation failed at {}: {}", request.getRequestURI(), ex.getMessage());
        
        List<String> errors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.add(String.format("%s: %s", fieldName, errorMessage));
        });

        ApiResponse<Void> response = ApiResponse.error(
            errors,
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            ErrorType.VALIDATION_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolationException(
            ConstraintViolationException ex, HttpServletRequest request) {
        
        logger.warn("Constraint violation at {}: {}", request.getRequestURI(), ex.getMessage());
        
        List<String> errors = new ArrayList<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            errors.add(String.format("%s: %s", violation.getPropertyPath(), violation.getMessage()));
        }

        ApiResponse<Void> response = ApiResponse.error(
            errors,
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            ErrorType.VALIDATION_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuthenticationException(
            AuthenticationException ex, HttpServletRequest request) {
        
        logger.warn("Authentication failed at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            "Authentication failed",
            HttpStatus.UNAUTHORIZED.value(),
            request.getRequestURI(),
            ErrorType.AUTHENTICATION_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Handle bad credentials
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(
            BadCredentialsException ex, HttpServletRequest request) {
        
        logger.warn("Bad credentials at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            "Invalid email or password",
            HttpStatus.UNAUTHORIZED.value(),
            request.getRequestURI(),
            ErrorType.AUTHENTICATION_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(
            AccessDeniedException ex, HttpServletRequest request) {
        
        logger.warn("Access denied at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            "Access denied. You don't have permission to access this resource",
            HttpStatus.FORBIDDEN.value(),
            request.getRequestURI(),
            ErrorType.PERMISSION_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodNotSupportedException(
            HttpRequestMethodNotSupportedException ex, HttpServletRequest request) {
        
        logger.warn("Method not supported at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            String.format("HTTP method '%s' is not supported for this endpoint", ex.getMethod()),
            HttpStatus.METHOD_NOT_ALLOWED.value(),
            request.getRequestURI(),
            ErrorType.SYSTEM_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.METHOD_NOT_ALLOWED);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Void>> handleMediaTypeNotSupportedException(
            HttpMediaTypeNotSupportedException ex, HttpServletRequest request) {
        
        logger.warn("Media type not supported at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            "Unsupported media type. Please check Content-Type header",
            HttpStatus.UNSUPPORTED_MEDIA_TYPE.value(),
            request.getRequestURI(),
            ErrorType.SYSTEM_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Void>> handleMissingParameterException(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        
        logger.warn("Missing parameter at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            String.format("Required parameter '%s' is missing", ex.getParameterName()),
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            ErrorType.VALIDATION_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Void>> handleTypeMismatchException(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        
        logger.warn("Type mismatch at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            String.format("Invalid value for parameter '%s'. Expected type: %s", 
                ex.getName(), ex.getRequiredType().getSimpleName()),
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            ErrorType.VALIDATION_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Void>> handleMessageNotReadableException(
            HttpMessageNotReadableException ex, HttpServletRequest request) {
        
        logger.warn("Malformed JSON at {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            "Malformed JSON request body",
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            ErrorType.SYSTEM_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNoHandlerFoundException(
            NoHandlerFoundException ex, HttpServletRequest request) {
        
        logger.warn("No handler found for {}: {}", request.getRequestURI(), ex.getMessage());
        
        ApiResponse<Void> response = ApiResponse.error(
            "The requested endpoint was not found",
            HttpStatus.NOT_FOUND.value(),
            request.getRequestURI(),
            ErrorType.NOT_FOUND
        );

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, HttpServletRequest request) {
        
        logger.error("Data integrity violation at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        String message = "Data integrity violation";
        if (ex.getCause() != null && ex.getCause().getMessage() != null) {
            String causeMessage = ex.getCause().getMessage();
            if (causeMessage.contains("unique constraint") || causeMessage.contains("duplicate")) {
                message = "A record with this information already exists";
            } else if (causeMessage.contains("foreign key constraint")) {
                message = "Referenced record does not exist or is being used by other records";
            }
        }

        ApiResponse<Void> response = ApiResponse.error(
            message,
            HttpStatus.CONFLICT.value(),
            request.getRequestURI(),
            ErrorType.CONFLICT
        );

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        logger.error("Unexpected error at {}: {}", request.getRequestURI(), ex.getMessage(), ex);
        
        ApiResponse<Void> response = ApiResponse.error(
            "An unexpected error occurred. Please try again later",
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            request.getRequestURI(),
            ErrorType.SYSTEM_ERROR
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}