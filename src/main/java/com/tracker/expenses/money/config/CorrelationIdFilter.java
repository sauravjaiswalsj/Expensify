package com.tracker.expenses.money.config;

import com.tracker.expenses.money.dto.ApiResponses;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class CorrelationIdFilter extends OncePerRequestFilter {
    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final int MAX_CORRELATION_ID_LENGTH = 128;
    private static final Pattern SAFE_CORRELATION_ID = Pattern.compile("^[A-Za-z0-9._:-]+$");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String correlationId = sanitizeCorrelationId(request.getHeader(CORRELATION_ID_HEADER));

        MDC.put(ApiResponses.CORRELATION_ID_KEY, correlationId);
        response.setHeader(CORRELATION_ID_HEADER, correlationId);
        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(ApiResponses.CORRELATION_ID_KEY);
        }
    }

    private String sanitizeCorrelationId(String correlationId) {
        if (correlationId == null) {
            return UUID.randomUUID().toString();
        }

        String trimmedCorrelationId = correlationId.trim();
        if (trimmedCorrelationId.isBlank()
                || trimmedCorrelationId.length() > MAX_CORRELATION_ID_LENGTH
                || !SAFE_CORRELATION_ID.matcher(trimmedCorrelationId).matches()) {
            return UUID.randomUUID().toString();
        }

        return trimmedCorrelationId;
    }
}
