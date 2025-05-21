package com.tracker.expenses.money.exception;

public class InvalidExpense extends RuntimeException {
    public InvalidExpense(String message) {
        super(message);
    }
}
