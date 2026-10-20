package com.laikaclub.auth.controller;

import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.repository.UserRepository;
import com.laikaclub.auth.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal")
public class InternalController {

    private final UserRepository userRepository;
    private final MailService mailService;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired
    public InternalController(UserRepository userRepository, MailService mailService) {
        this.userRepository = userRepository;
        this.mailService = mailService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getInternalUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("created_at", u.getCreatedAt() != null ? u.getCreatedAt().format(formatter) : null);
            map.put("last_login", u.getLastLogin());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> getInternalUserById(@PathVariable Long userId) {
        User u = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Map<String, Object> map = new HashMap<>();
        map.put("id", u.getId());
        map.put("email", u.getEmail());
        map.put("created_at", u.getCreatedAt() != null ? u.getCreatedAt().format(formatter) : null);
        map.put("last_login", u.getLastLogin());

        return ResponseEntity.ok(map);
    }

    @GetMapping("/users/by-email")
    public ResponseEntity<Map<String, Object>> getInternalUserByEmail(@org.springframework.web.bind.annotation.RequestParam("email") String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return userRepository.findByEmailIgnoreCase(email.trim())
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    map.put("email", u.getEmail());
                    map.put("firstName", u.getFirstName());
                    map.put("lastName", u.getLastName());
                    map.put("name", ((u.getFirstName() != null ? u.getFirstName() : "") + " " + (u.getLastName() != null ? u.getLastName() : "")).trim());
                    map.put("status", u.getStatus());
                    return ResponseEntity.ok(map);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/mail/courtesy")
    public ResponseEntity<?> sendCourtesyEmail(@RequestBody Map<String, Object> payload) {
        String toEmail = (String) payload.get("to_email");
        if (toEmail == null || toEmail.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "to_email is required"));
        }
        String recipientName = (String) payload.get("recipient_name");
        String eventName = (String) payload.get("event_name");
        String eventDate = (String) payload.get("event_date");
        String eventTime = (String) payload.get("event_time");
        String sectionName = (String) payload.get("section_name");
        String seatId = (String) payload.get("seat_id");
        String ticketCode = (String) payload.get("ticket_code");
        String qrData = (String) payload.get("qr_data");
        String motive = (String) payload.get("motive");
        String issuerInfo = (String) payload.get("issuer_info");

        mailService.sendCourtesyTicket(toEmail, recipientName, eventName, eventDate, eventTime,
                sectionName, seatId, ticketCode, qrData, motive, issuerInfo);

        return ResponseEntity.ok(Map.of("success", true, "message", "Email de cortesía puesto en cola"));
    }
}
