package com.shopstream.coreapi.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender,
            @Value("${app.mail.from:ShopStream <no-reply@shopstream.local>}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    /** Runs in the background. A failed email never breaks an order or a payment. */
    @Async
    public void send(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (RuntimeException ex) {
            log.warn("Could not send email: {}", ex.getMessage());
        }
    }
}