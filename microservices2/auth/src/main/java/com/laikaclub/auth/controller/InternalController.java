package com.laikaclub.auth.controller;

import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/internal")
public class InternalController {

    private final UserRepository userRepository;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Autowired
    public InternalController(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
