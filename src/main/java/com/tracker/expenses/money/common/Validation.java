package com.tracker.expenses.money.common;

import com.tracker.expenses.money.exception.InvalidEmailException;
import com.tracker.expenses.money.exception.InvalidUserLength;
import org.springframework.stereotype.Component;


public class Validation {
    public static boolean emailValid(String email) {
        String regex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
        return email.matches(regex);
    }
    public static boolean usernameValid(String username) {
        return username.length() >= 4 && username.length() <= 20;
    }

    /****
     * Checks if the password length is between 4 and 20 characters inclusive.
     *
     * @param password the password string to validate
     * @return true if the password length is valid, false otherwise
     */
    public static boolean passwordValid(String password) {

        return password.length() >= 4 && password.length() <= 20;
    }
    /****
     * Validates the given email address and throws an exception if it is invalid.
     *
     * @param email the email address to validate
     * @throws InvalidEmailException if the email address does not match the required format
     */
    public static void isEmailValid(String email){
        if (!Validation.emailValid(email)){
            throw new InvalidEmailException("Invalid email"+email);
        }
    }

    /****
     * Validates that the username length is between 4 and 20 characters.
     *
     * @param username the username to validate
     * @throws InvalidUserLength if the username is shorter than 4 or longer than 20 characters
     */
    public static void isUsernameValid(String username){
        int length = username.length();

        if (length < 4 || length > 20){
            throw new InvalidUserLength("Username must be between 4 and 20 characters");
        }
    }
}
