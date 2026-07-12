package com.laikaclub.auth.controller;

import com.laikaclub.auth.domain.AuthLog;
import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.dto.request.AdminPasswordResetRequest;
import com.laikaclub.auth.dto.request.StatusUpdateRequest;
import com.laikaclub.auth.dto.response.PermissionRequestResponse;
import com.laikaclub.auth.service.AuditService;
import com.laikaclub.auth.service.AuthService;
import com.laikaclub.auth.service.MailService;
import com.laikaclub.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.laikaclub.auth.config.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class AdminController {

    private final UserService userService;
    private final AuthService authService;
    private final AuditService auditService;
    private final MailService mailService;

    @Autowired
    public AdminController(UserService userService,
                           AuthService authService,
                           AuditService auditService,
                           MailService mailService) {
        this.userService = userService;
        this.authService = authService;
        this.auditService = auditService;
        this.mailService = mailService;
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> getAdminUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        
        Map<String, Object> result = userService.getUsers(search, role, status, page, limit);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/admin/users/{userId}/status")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> patchUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody StatusUpdateRequest request) {
        
        userService.updateStatus(userId, request.getStatus());
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Estado actualizado a " + request.getStatus());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin/users/{userId}/password")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> patchUserPassword(
            @PathVariable Long userId,
            @Valid @RequestBody AdminPasswordResetRequest request) {
        
        userService.resetPassword(userId, request.getNewPassword());
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Contraseña reseteada");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/admin/users/{userId}/unlock")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> patchUnlockUser(@PathVariable Long userId) {
        userService.unlockUser(userId);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Usuario desbloqueado");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/broadcast")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, Object>> adminBroadcast(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Contenido faltante");
        }
        int sent = userService.broadcastAnnouncement(content);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("sent_to", sent);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/admin/test-email")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<Map<String, String>> testEmail(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email no proporcionado");
        }
        boolean success = mailService.testSmtpConnection(email);
        Map<String, String> response = new HashMap<>();
        response.put("status", success ? "success" : "error");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/audit")
    @PreAuthorize("hasAnyRole('admin', 'gestor')")
    public ResponseEntity<List<AuthLog>> getAuditLogs(
            @RequestParam(defaultValue = "200") int limit,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String eventType) {
        
        List<AuthLog> logs = auditService.getAuthLogs(limit, role, eventType);
        return ResponseEntity.ok(logs);
    }

    @PostMapping("/request-permission")
    public ResponseEntity<Map<String, Object>> requestPermission(
            @Valid @RequestBody com.laikaclub.auth.dto.request.PermissionRequestDto request,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        authService.requestPermission(principal.getId(), request.getPermissionType());
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Solicitud de permiso enviada");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all-requests")
    public ResponseEntity<List<PermissionRequestResponse>> listRequests() {
        List<PermissionRequestResponse> requests = authService.getAllPermissionRequests();
        return ResponseEntity.ok(requests);
    }
}
