package com.laikaclub.auth.controller;

import com.laikaclub.auth.config.UserPrincipal;
import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.dto.request.UpdatePermissionsRequest;
import com.laikaclub.auth.dto.response.PermissionResponse;
import com.laikaclub.auth.dto.response.PublicProfileResponse;
import com.laikaclub.auth.dto.response.UserProfileResponse;
import com.laikaclub.auth.exception.InvalidCredentialsException;
import com.laikaclub.auth.exception.UnauthorizedException;
import com.laikaclub.auth.mapper.UserMapper;
import com.laikaclub.auth.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.findById(principal.getId())
                .orElseThrow(() -> new InvalidCredentialsException("Usuario no encontrado"));
        return ResponseEntity.ok(UserMapper.toProfileResponse(user));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<Map<String, Object>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        User user = userService.updateAvatar(principal.getId(), file);
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("avatarUrl", user.getAvatarUrl());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}/public")
    public ResponseEntity<PublicProfileResponse> getPublicProfile(@PathVariable Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return ResponseEntity.ok(UserMapper.toPublicProfileResponse(user));
    }

    @GetMapping("/{userId}/permissions")
    @PreAuthorize("hasAnyRole('admin', 'gestor')")
    public ResponseEntity<PermissionResponse> getPermissions(@PathVariable Long userId) {
        User user = userService.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return ResponseEntity.ok(new PermissionResponse(user.getRole(), user.getPermissions()));
    }

    @PutMapping("/{userId}/permissions")
    @PreAuthorize("hasAnyRole('admin', 'gestor')")
    public ResponseEntity<Map<String, Object>> updatePermissions(
            @PathVariable Long userId,
            @Valid @RequestBody UpdatePermissionsRequest request) {
        
        userService.updatePermissions(userId, request.getRole(), request.getPermissions());
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Permisos actualizados");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/push/send")
    @PreAuthorize("hasAnyRole('admin', 'gestor')")
    public ResponseEntity<Map<String, Object>> sendPush(
            @RequestBody Map<String, String> request) {
        
        String title = request.get("title");
        String body = request.get("body");
        String url = request.get("url");
        String audience = request.get("audience");
        
        int sentCount = userService.sendPushNotification(title, body, url, audience);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("sentCount", sentCount);
        return ResponseEntity.ok(response);
    }
}
