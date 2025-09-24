package com.tracker.expenses.money.exception;

public class VerificationCodeIncorrectException extends RuntimeException {
    public VerificationCodeIncorrectException(String message) {
        super(message);
    }
}
