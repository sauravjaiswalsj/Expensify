package com.tracker.expenses.money.common;

import java.security.SecureRandom;

public class GenerateCodes {
    public static String generateVerificationCode() {
        return getCode();
    }
    private static String getCode(){
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}
