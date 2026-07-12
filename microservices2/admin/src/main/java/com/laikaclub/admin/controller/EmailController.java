package com.laikaclub.admin.controller;

import com.laikaclub.admin.dto.EmailRequest;
import com.laikaclub.admin.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin/emails")
@CrossOrigin(origins = "*") // Adjust based on your security policies
public class EmailController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendEmail(@RequestBody EmailRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            emailService.sendHtmlEmail(request.getEmail(), request.getSubject(), request.getHtmlContent());
            response.put("status", "success");
            response.put("message", "Email enviado exitosamente a " + request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Falla al enviar correo: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
