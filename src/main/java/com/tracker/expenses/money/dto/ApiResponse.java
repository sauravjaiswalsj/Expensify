package com.tracker.expenses.money.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.io.Serializable;

@Data
@AllArgsConstructor
public class ApiResponse<T> implements Serializable {
    private boolean success;
    private String message;
    private T data;
    private String errorCode;
    private String correlationId;
}
