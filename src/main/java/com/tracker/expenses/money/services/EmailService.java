package com.tracker.expenses.money.services;

import org.springframework.stereotype.Service;

@Service
public interface EmailService {

    /**
 * Sends a generic email to the specified recipient with the given subject and body.
 *
 * @param to the recipient's email address
 * @param subject the subject line of the email
 * @param body the content of the email message
 */
void sendEmail(String to, String subject, String body);

    /****
 * Sends an email containing a verification code to the specified recipient.
 *
 * @param to the recipient's email address
 * @param verificationCode the verification code to include in the email
 */
void sendVerificationEmail(String to, String verificationCode);

    /**
 * Sends a password reset email containing a verification code to the specified recipient.
 *
 * @param to the recipient's email address
 * @param verificationCode the verification code to include in the email
 */
void sendPasswordResetEmail(String to, String verificationCode);

    /**
 * Sends a welcome email to the specified recipient.
 *
 * @param to the email address of the recipient
 */
void sendWelcomeEmail(String to);

    /**
 * Sends an email to notify the recipient of successful account verification.
 *
 * @param to the recipient's email address
 */
void sendVerificationSuccessEmail(String to);
    /****
 * Sends an email to notify the recipient of a successful password reset.
 *
 * @param to the recipient's email address
 */
void sendResetSuccessEmail(String to);
}
