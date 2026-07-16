package com.laikaclub.auth.service;

import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.exception.UnauthorizedException;
import com.laikaclub.auth.integration.FileStorageService;
import com.laikaclub.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.util.Collections;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStorageService fileStorageService;
    private final MailService mailService;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, FileStorageService fileStorageService, @Lazy MailService mailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.fileStorageService = fileStorageService;
        this.mailService = mailService;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email.trim());
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    @Transactional
    public User createUser(String firstName, String lastName, String email, String phone, String password, String provider) {
        User user = new User();
        user.setFirstName(firstName != null ? firstName : "");
        user.setLastName(lastName != null ? lastName : "");
        user.setEmail(email.toLowerCase().trim());
        user.setPhone(phone);
        user.setSocialProvider(provider);
        
        if (password != null) {
            user.setPasswordHash(passwordEncoder.encode(password));
        }
        
        // Roles & Permissions defaults are handled by @PrePersist in User.java
        return userRepository.save(user);
    }

    @Transactional
    public User updateStatus(Long id, String status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        // Protección de Admin raíz
        if (user.getEmail().equalsIgnoreCase("admin@laikaclub.com")) {
            throw new UnauthorizedException("No se puede deshabilitar la cuenta del administrador raíz");
        }

        user.setStatus(status);
        return userRepository.save(user);
    }

    @Transactional
    public User resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setFailedAttempts(0);
        user.setLockoutUntil(null);
        return userRepository.save(user);
    }

    @Transactional
    public User unlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        user.setStatus("active");
        user.setFailedAttempts(0);
        user.setLockoutUntil(null);
        return userRepository.save(user);
    }

    @Transactional
    public User updateAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        String avatarUrl = fileStorageService.saveAvatar(file, userId);
        user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }

    @Transactional
    public void updateUserAvatarUrl(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
    }

    @Transactional
    public User updatePermissions(Long id, String role, Map<String, Boolean> permissions) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        user.setRole(role);
        
        // Combinamos permisos por defecto del rol con los enviados
        Map<String, Boolean> mergedPermissions = new HashMap<>(user.getPermissions());
        if (permissions != null) {
            mergedPermissions.putAll(permissions);
        }
        
        // Asignar permisos por defecto del rol
        if ("admin".equalsIgnoreCase(role) || "gestor".equalsIgnoreCase(role)) {
            mergedPermissions.put("canViewDashboard", true);
            mergedPermissions.put("canCreateEvents", true);
            mergedPermissions.put("canEditEvents", true);
            mergedPermissions.put("canViewEventAnalytics", true);
            mergedPermissions.put("canManageVenues", true);
            if ("admin".equalsIgnoreCase(role)) {
                mergedPermissions.put("canManageUsers", true);
            }
        }
        
        user.setPermissions(mergedPermissions);
        return userRepository.save(user);
    }

    public int broadcastAnnouncement(String content) {
        List<String> activeEmails = userRepository.findEmailsByStatus("active");
        logger.info("Enviando anuncio a {} usuarios activos", activeEmails.size());
        
        for (String email : activeEmails) {
            mailService.sendAnnouncement(email, content);
        }
        
        return activeEmails.size();
    }

    public Map<String, Object> getUsers(String search, String role, String status, int page, int limit) {
        int pageNum = page < 1 ? 0 : page - 1;
        int limitNum = limit < 1 ? 20 : limit;

        Pageable pageable = PageRequest.of(pageNum, limitNum, Sort.by("id").descending());
        Specification<User> spec = Specification.where(null);

        if (search != null && !search.trim().isEmpty()) {
            String searchPattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("firstName")), searchPattern),
                    cb.like(cb.lower(root.get("lastName")), searchPattern),
                    cb.like(cb.lower(root.get("email")), searchPattern)
            ));
        }

        if (role != null && !role.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), role));
        }

        if (status != null && !status.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<Map<String, Object>> usersList = userPage.getContent().stream().map(user -> {
            Map<String, Object> u = new HashMap<>();
            u.put("id", user.getId());
            u.put("first_name", user.getFirstName());
            u.put("last_name", user.getLastName());
            u.put("email", user.getEmail());
            u.put("phone", user.getPhone());
            u.put("role", user.getRole());
            u.put("status", user.getStatus());
            u.put("lockout_until", user.getLockoutUntil());
            u.put("last_login", user.getLastLogin());
            u.put("created_at", user.getCreatedAt() != null ? user.getCreatedAt().format(formatter) : null);
            u.put("expo_push_token", user.getExpoPushToken());
            return u;
        }).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("users", usersList);
        result.put("total", userPage.getTotalElements());

        return result;
    }

    @Transactional
    public void updatePushToken(Long userId, String token) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setExpoPushToken(token);
            userRepository.save(user);
        });
    }

    @Transactional(readOnly = true)
    public int sendPushNotification(String title, String body, String url, String audience) {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> messages = new ArrayList<>();
        
        for (User user : users) {
            if (user.getExpoPushToken() != null && !user.getExpoPushToken().isEmpty()) {
                Map<String, Object> msg = new HashMap<>();
                msg.put("to", user.getExpoPushToken());
                msg.put("sound", "default");
                msg.put("title", title);
                msg.put("body", body);
                
                if (url != null && !url.isEmpty()) {
                    Map<String, String> data = new HashMap<>();
                    data.put("url", url);
                    msg.put("data", data);
                }
                messages.add(msg);
            }
        }
        
        if (messages.isEmpty()) {
            logger.warn("No valid Expo Push Tokens found to send notifications.");
            return 0;
        }
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
            
            HttpEntity<List<Map<String, Object>>> request = new HttpEntity<>(messages, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                "https://exp.host/--/api/v2/push/send", 
                request, 
                String.class
            );
            
            logger.info("Expo Push API Response: {}", response.getBody());
            return messages.size();
        } catch (Exception e) {
            logger.error("Failed to send push notification to Expo Servers", e);
            return 0;
        }
    }
}
