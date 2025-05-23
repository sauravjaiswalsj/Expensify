package com.tracker.expenses.money.exception;

public class VerificationCodeIncorrect extends RuntimeException {
    /****
     * Constructs a new VerificationCodeIncorrect exception with the specified detail message.
     *
     * @param message the detail message explaining the reason for the exception
     */
    public VerificationCodeIncorrect(String message) {
        super(message);
    }
}
