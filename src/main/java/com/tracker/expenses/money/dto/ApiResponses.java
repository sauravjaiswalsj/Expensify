package com.tracker.expenses.money.dto;

import org.slf4j.MDC;

public final class ApiResponses {
    public static final String CORRELATION_ID_KEY = "correlationId";

    private ApiResponses() {
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null, correlationId());
    }

    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return new ApiResponse<>(false, message, null, errorCode, correlationId());
    }

    public static String correlationId() {
        return MDC.get(CORRELATION_ID_KEY);
    }
}
