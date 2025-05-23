package com.tracker.expenses.money.exception;

public class InvalidUser extends RuntimeException {
    /**
     * Constructs a new InvalidUser exception with the specified detail message.
     *
     * @param message the detail message explaining the reason for the exception
     */
    public InvalidUser(String message) {
        super(message);
    }
}
