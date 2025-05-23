package com.tracker.expenses.money.exception;

public class VerificationCodeIncorrect extends RuntimeException {
    /**
     * Constructs a new VerificationCodeIncorrect exception with the specified detail message.
     *
     * @param message the detail message explaining why the verification code is incorrect
     */
    public VerificationCodeIncorrect(String message) {
        super(message);
    }
}
