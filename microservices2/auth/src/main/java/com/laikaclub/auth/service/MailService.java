package com.laikaclub.auth.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;

@Service
public class MailService {

    private static final Logger logger = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Autowired
    public MailService(JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendLoginAlert(String toEmail, String name, String date, String provider) {
        try {
            logger.info("Enviando correo de alerta de seguridad a {}", toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("email", toEmail);
            context.setVariable("date", date);
            context.setVariable("provider", provider);

            String html = templateEngine.process("login_alert", context);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("LAIKA Club - Alerta de Seguridad");
            helper.setText(html, true);

            mailSender.send(message);
            logger.info("Correo de alerta enviado exitosamente a {}", toEmail);
        } catch (Exception e) {
            logger.error("Error al enviar correo de alerta a {}", toEmail, e);
        }
    }

    @Async
    public void sendPasswordReset(String toEmail, String code) {
        try {
            logger.info("Enviando correo de recuperación de contraseña a {}", toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("code", code);

            String html = templateEngine.process("password_reset", context);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("LAIKA Club - Recuperación de Acceso");
            helper.setText(html, true);

            mailSender.send(message);
            logger.info("Correo de recuperación enviado exitosamente a {}", toEmail);
        } catch (Exception e) {
            logger.error("Error al enviar correo de recuperación a {}", toEmail, e);
        }
    }

    @Async
    public void sendAnnouncement(String toEmail, String content) {
        try {
            logger.info("Enviando correo de anuncio a {}", toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("content", content);

            String html = templateEngine.process("announcement", context);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("LAIKA Club - Anuncio Oficial");
            helper.setText(html, true);

            mailSender.send(message);
            logger.debug("Correo de anuncio enviado a {}", toEmail);
        } catch (Exception e) {
            logger.error("Error al enviar anuncio a {}", toEmail, e);
        }
    }

    public boolean testSmtpConnection(String toEmail) {
        try {
            logger.info("Probando conexión SMTP enviando correo de prueba a {}", toEmail);
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("LAIKA Club - Test SMTP Connection");
            helper.setText("This is a test email verifying that SMTP connection works from the Java auth service.", false);

            mailSender.send(message);
            return true;
        } catch (Exception e) {
            logger.error("La prueba de conexión SMTP falló para {}", toEmail, e);
            return false;
        }
    }
}
