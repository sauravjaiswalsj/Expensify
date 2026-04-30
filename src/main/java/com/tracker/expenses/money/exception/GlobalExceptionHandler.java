package com.tracker.expenses.money.exception;

import com.tracker.expenses.money.dto.ApiResponse;
import com.tracker.expenses.money.dto.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleMethodArgumentNotValidException(MethodArgumentNotValidException exception) {
        String fieldError = exception.getBindingResult().getFieldError() == null
                ? "Request validation failed"
                : exception.getBindingResult().getFieldError().getDefaultMessage();
        String errorMessage = "Invalid input: " + fieldError;
        return ResponseEntity.badRequest().body(ApiResponses.error(errorMessage, "VALIDATION_ERROR"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception exception) {
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponses.error("Internal server error", "INTERNAL_SERVER_ERROR"));
    }
}
