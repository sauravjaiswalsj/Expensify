package com.tracker.expenses.money.common;

import java.util.Random;

public class GenerateCodes {
    public static String generateVerificationCode() {
        Random random = new Random();
        int code = random.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}
