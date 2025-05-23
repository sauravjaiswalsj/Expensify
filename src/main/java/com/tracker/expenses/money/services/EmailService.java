package com.tracker.expenses.money.services;

import org.springframework.stereotype.Service;

@Service
public interface EmailService {

    void sendEmail(String to, String subject, String body);

    void sendVerificationEmail(String to, String verificationCode);

    void sendPasswordResetEmail(String to, String verificationCode);

    void sendWelcomeEmail(String to);

    void sendVerificationSuccessEmail(String to);
    void sendResetSuccessEmail(String to);
}
