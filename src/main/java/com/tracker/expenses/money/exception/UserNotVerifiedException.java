package com.tracker.expenses.money.exception;

public class UserNotVerifiedException extends RuntimeException {
    /**
         * Constructs a new UserNotVerifiedException with the specified detail message.
         *
         * @param message the detail message explaining the reason for the exception
         */
    public UserNotVerifiedException(String message) {
        super(message);
    }
}
