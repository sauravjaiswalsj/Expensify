package com.tracker.expenses.money.exception;

public class UserAlreadyVerifiedException extends RuntimeException {
    /**
     * Constructs a new exception indicating that the user has already been verified.
     *
     * @param message the detail message explaining the exception
     */
    public UserAlreadyVerifiedException(String message) {
        super(message);
    }
}
