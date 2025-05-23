package com.tracker.expenses.money.services.impl;

import com.tracker.expenses.money.services.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    private void emailSender(String to, String subject, String body){
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);
        try{
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);

            emailSender.send(message);
        }
        catch (MessagingException e){
            throw new RuntimeException("Failed to send email", e);
        }
    }

    /**
     * @param to
     * @param subject
     * @param body
     */
    @Override
    public void sendEmail(String to, String subject, String body) {
        emailSender(to, subject, body);
    }

    /**
     * @param to
     * @param verificationCode
     */
    @Override
    public void sendVerificationEmail(String to, String verificationCode) {
        String htmlBody = verifyEmailBodyByCode.replace("{{CODE}}", verificationCode);
        emailSender(to, verifySubject, htmlBody);
    }

    /**
     * @param to
     * @param verificationCode
     */
    @Override
    public void sendPasswordResetEmail(String to, String verificationCode) {
        String subject = "Password Reset Request";
        String htmlBody = verifyEmailBodyByCode.replace("{{CODE}}", verificationCode);
        emailSender(to,subject, htmlBody);
    }

    /**
     * @param to
     */
    @Override
    public void sendWelcomeEmail(String to) {
        emailSender(to, welcomeSubject, welcomeBody);
    }


    private String welcomeSubject = "🎉 Welcome to Expensify.ai!";

    private String welcomeBody = """
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome Email</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: 'Helvetica Neue', sans-serif;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
            <tr>
              <td style="background-color: #4f46e5; padding: 30px 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 32px;">Welcome to OurApp! 🎉</h1>
                <p style="color: #e0e7ff; font-size: 16px; margin-top: 10px;">Your personal expense tracker</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px;">
                <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                  We're thrilled to have you here! At <strong>OurApp</strong>, we're on a mission to help you take full control of your finances with ease and elegance.
                </p>
                <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                  With your new account, you can:
                </p>
                <ul style="font-size: 16px; color: #333333; line-height: 1.8; padding-left: 20px;">
                  <li>💰 Track daily expenses and monthly budgets</li>
                  <li>📈 Gain insights with intuitive visual reports</li>
                  <li>🔒 Keep your data secure and private</li>
                </ul>
                <p style="text-align: center; margin: 40px 0;">
                  <a href="https://ourapp.com/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-size: 16px; font-weight: bold;">
                    Go to Dashboard →
                  </a>
                </p>
                <p style="font-size: 14px; color: #666666; text-align: center;">
                  Questions? Reach us at <a href="mailto:support@ourapp.com" style="color: #4f46e5;">support@ourapp.com</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                © 2025 OurApp Inc. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""";

    String verifySubject = "🔐 Verify Your Email - Expensify.ai";

    String verifyEmailBodyByCode = """
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verification Code</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:'Helvetica Neue', sans-serif;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
            <tr>
              <td style="background-color: #4f46e5; padding: 30px 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Your Verification Code</h1>
                <p style="color: #e0e7ff; font-size: 16px; margin-top: 10px;">Secure your account access</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 40px;">
                <p style="font-size: 16px; color: #333333; line-height: 1.6; text-align: center;">
                  Use the 6-digit code below to verify your email address. This code is valid for the next 10 minutes.
                </p>
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">
                    {{CODE}}
                  </span>
                </div>
                <p style="font-size: 14px; color: #666666; text-align: center;">
                  Didn’t request this code? Please ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                © 2025 OurApp Inc. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""";

    String verifyBodyByLink = """
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: 'Helvetica Neue', sans-serif;">
    <table width="100%%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
            <tr>
              <td style="background-color: #4f46e5; padding: 30px 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 30px;">Verify Your Email Address</h1>
                <p style="color: #e0e7ff; font-size: 16px; margin-top: 10px;">You're almost there!</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px 40px;">
                <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                  To complete your registration with <strong>OurApp</strong>, please confirm your email address by clicking the button below.
                </p>
                <p style="text-align: center; margin: 40px 0;">
                  <a href="https://ourapp.com/verify?token=YOUR_VERIFICATION_TOKEN" 
                     style="background-color: #22c55e; 
                            color: #ffffff; 
                            padding: 14px 28px; 
                            border-radius: 6px; 
                            text-decoration: none; 
                            font-size: 16px; 
                            font-weight: bold;">
                    ✅ Verify Email
                  </a>
                </p>
                <p style="font-size: 14px; color: #666666; text-align: center; line-height: 1.6;">
                  If the button doesn’t work, copy and paste this link into your browser:<br>
                  <a href="https://ourapp.com/verify?token=YOUR_VERIFICATION_TOKEN" style="color: #4f46e5;">
                    https://ourapp.com/verify?token=YOUR_VERIFICATION_TOKEN
                  </a>
                </p>
                <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 40px;">
                  If you didn’t create an account, you can safely ignore this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
                © 2025 OurApp Inc. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
""";

}
