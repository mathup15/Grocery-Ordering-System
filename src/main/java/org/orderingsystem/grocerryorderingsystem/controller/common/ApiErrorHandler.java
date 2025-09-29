package org.orderingsystem.grocerryorderingsystem.controller.common;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

@RestControllerAdvice
public class ApiErrorHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String,String>> badRequest(IllegalArgumentException ex){
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String,String>> conflict(DataIntegrityViolationException ex){
        return ResponseEntity.status(409).body(Map.of("error","Duplicate or invalid data (likely SKU)."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String,String>> accessDenied(AccessDeniedException ex){
        return ResponseEntity.status(403).body(Map.of("error","Access denied"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String,String>> fileTooLarge(MaxUploadSizeExceededException ex){
        return ResponseEntity.status(413).body(Map.of("error","File size exceeds limit"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> genericError(Exception ex){
        return ResponseEntity.status(500).body(Map.of("error","Internal server error"));
    }
}