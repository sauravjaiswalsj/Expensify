package com.tracker.expenses.money.common;

import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.InvalidUserLengthException;


public class Validation {
    public static boolean emailValid(String email) {
        String regex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(regex);
    }
    public static boolean isValidUsername(String username) {
        String regex = "^[a-zA-Z0-9._-]{4,20}$";
        return username.matches(regex);
    }
    public static boolean isValidPassword(String password) {
        String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(regex);
    }
    public static void isPasswordValid(String password) {
        if (!Validation.isValidPassword(password)) {
            throw new InvalidUserLengthException("Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
        }
    }

    public static void isEmailValid(String email){
        if (!Validation.emailValid(email)){
            throw new InvalidEmailException("Invalid email: "+email);
        }
    }

    public static void isUsernameValid(String username){
        if (!Validation.isValidUsername(username)){
            throw new InvalidUserLengthException("Username must be between 4 and 20 characters long and can only contain letters, numbers, underscores, and hyphens.");
        }
    }
}
