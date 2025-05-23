package com.tracker.expenses.money.exception;

public class VerificationCodeIncorrect extends RuntimeException {
    public VerificationCodeIncorrect(String message) {
        super(message);
    }
}
