package com.tracker.expenses.money.common;

import org.springframework.stereotype.Component;


public class Validation {
    public static boolean emailValid(String email) {
        String regex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(regex);
    }
    public static boolean usernameValid(String username) {
        return username.length() >= 4 && username.length() <= 20;
    }

    public static boolean passwordValid(String password) {

        return password.length() >= 4 && password.length() <= 20;
    }
}
