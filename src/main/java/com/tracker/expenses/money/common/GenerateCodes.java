package com.tracker.expenses.money.common;

import java.util.Random;

public class GenerateCodes {
    /****
     * Generates a random six-digit numeric verification code as a string.
     *
     * @return a string representing a randomly generated six-digit verification code
     */
    public static String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}
