package com.laikaclub.auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Map<String, Object>> handleAccountLocked(AccountLockedException ex) {
        Map<String, Object> detail = new HashMap<>();
        detail.put("message", ex.getMessage());
        detail.put("retry_after", ex.getRetryAfter());

        Map<String, Object> response = new HashMap<>();
        response.put("detail", detail);

        return ResponseEntity.status(HttpStatus.LOCKED).body(response);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {
        Map<String, Object> response = new HashMap<>();

        if (ex.getAttempts() != null) {
            Map<String, Object> detail = new HashMap<>();
            detail.put("message", ex.getMessage());
            detail.put("attempts", ex.getAttempts());
            detail.put("max_attempts", ex.getMaxAttempts());
            response.put("detail", detail);
        } else {
            response.put("detail", ex.getMessage());
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("detail", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        List<Map<String, Object>> errorsList = new ArrayList<>();
        
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            
            Map<String, Object> errorMap = new HashMap<>();
            List<String> loc = new ArrayList<>();
            loc.add("body");
            loc.add(fieldName);
            
            errorMap.put("loc", loc);
            errorMap.put("msg", errorMessage);
            errorMap.put("type", "value_error");
            
            errorsList.add(errorMap);
        });

        Map<String, Object> response = new HashMap<>();
        response.put("detail", errorsList);
        
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response); // 422 Unprocessable Entity matching FastAPI validation status
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("detail", ex.getMessage() != null ? ex.getMessage() : "Error interno del servidor");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
