package com.tracker.expenses.money.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;
@Slf4j
@Configuration
public class EmailConfiguration {
    @Value("${spring.mail.username}")
    private String emailUsername;

    @Value("${spring.mail.password}")
    private String emailPassword;

    @Value("${spring.mail.host}")
    private String host;
    @Value("${spring.mail.port}")
    private int port;

    @Value("${spring.mail.protocol}")
    private String protocol;

    @Value("${spring.mail.properties.mail.debug}")
    private String debug;

    @Value("${spring.mail.properties.mail.smtp.auth}")
    private String auth;
    @Value("${spring.mail.properties.mail.smtp.starttls.enable}")
    private String starttls;

    @PostConstruct
    public void validateConfiguration() {
        log.debug("Email Configuration: ");
        log.debug("Username: {}", emailUsername);
        log.debug("Host: {}", host);
        log.debug("Port: {}", port);
        log.debug("Protocol: {}", protocol);
        log.debug("Debug: {}", debug);
        log.debug("Auth: {}", auth);
        log.debug("StartTLS: {}", starttls);

        if (emailUsername == null || emailUsername.isEmpty()) {
            log.error("Email username is not configured");
        }
        if (emailPassword == null || emailPassword.isEmpty()) {
            log.error("Email password is not configured");
        }
    }

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(emailUsername);
        mailSender.setPassword(emailPassword);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", protocol);
        props.put("mail.smtp.auth", auth);
        props.put("mail.smtp.starttls.enable", starttls);
        props.put("mail.debug", debug);
        return mailSender;
    }
}
