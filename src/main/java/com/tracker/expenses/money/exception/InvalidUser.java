package com.tracker.expenses.money.exception;

public class InvalidUser extends RuntimeException {
    public InvalidUser(String message) {
        super(message);
    }
}
