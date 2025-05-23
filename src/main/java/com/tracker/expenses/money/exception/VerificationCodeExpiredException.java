package com.tracker.expenses.money.exception;

public class VerificationCodeExpiredException extends RuntimeException {
    /**
     * Constructs a new VerificationCodeExpiredException with the specified detail message.
     *
     * @param message the detail message explaining the reason for the exception
     */
    public VerificationCodeExpiredException(String message) {
        super(message);
    }
}
