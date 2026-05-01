package com.tracker.expenses.money.common;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Locale;

public final class LogSanitizer {
    private LogSanitizer() {
    }

    public static String hashIdentifier(String value) {
        if (value == null || value.isBlank()) {
            return "unknown";
        }

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.trim().toLowerCase(Locale.ROOT).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (Exception ex) {
            return "hash-unavailable";
        }
    }
}
