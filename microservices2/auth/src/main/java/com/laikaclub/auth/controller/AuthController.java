package com.laikaclub.auth.controller;

import com.laikaclub.auth.config.UserPrincipal;
import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.dto.request.GoogleLoginRequest;
import com.laikaclub.auth.dto.request.LoginRequest;
import com.laikaclub.auth.dto.request.RegisterRequest;
import com.laikaclub.auth.dto.request.VerifyPasswordRequest;
import com.laikaclub.auth.dto.response.TokenResponse;
import com.laikaclub.auth.dto.response.UserProfileResponse;
import com.laikaclub.auth.exception.InvalidCredentialsException;
import com.laikaclub.auth.mapper.UserMapper;
import com.laikaclub.auth.service.AuditService;
import com.laikaclub.auth.service.AuthService;
import com.laikaclub.auth.service.TokenService;
import com.laikaclub.auth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final TokenService tokenService;
    private final AuditService auditService;

    @Autowired
    public AuthController(AuthService authService,
                          UserService userService,
                          TokenService tokenService,
                          AuditService auditService) {
        this.authService = authService;
        this.userService = userService;
        this.tokenService = tokenService;
        this.auditService = auditService;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        Map<String, String> res = new HashMap<>();
        res.put("status", "alive");
        res.put("service", "auth-service");
        return res;
    }

    @GetMapping("/debug-routes")
    public List<Map<String, Object>> debugRoutes() {
        // Retorna la lista estática de rutas expuestas para cumplir con el contrato de depuración
        List<Map<String, Object>> routes = new ArrayList<>();
        routes.add(Map.of("path", "/health", "methods", List.of("GET")));
        routes.add(Map.of("path", "/debug-routes", "methods", List.of("GET")));
        routes.add(Map.of("path", "/login", "methods", List.of("POST")));
        routes.add(Map.of("path", "/login/google", "methods", List.of("POST")));
        routes.add(Map.of("path", "/login/apple", "methods", List.of("POST")));
        routes.add(Map.of("path", "/register", "methods", List.of("POST")));
        routes.add(Map.of("path", "/check-lockout", "methods", List.of("GET")));
        routes.add(Map.of("path", "/verify", "methods", List.of("GET")));
        routes.add(Map.of("path", "/logout", "methods", List.of("POST")));
        routes.add(Map.of("path", "/refresh", "methods", List.of("POST")));
        routes.add(Map.of("path", "/forgot-password", "methods", List.of("POST")));
        routes.add(Map.of("path", "/verify-password", "methods", List.of("POST")));
        routes.add(Map.of("path", "/users/me", "methods", List.of("GET")));
        routes.add(Map.of("path", "/users/me/avatar", "methods", List.of("POST")));
        routes.add(Map.of("path", "/users/{id}/permissions", "methods", List.of("GET", "PUT")));
        return routes;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest) {
        String ip = getClientIp(servletRequest);
        String ua = servletRequest.getHeader("User-Agent");
        TokenResponse response = authService.login(request.getEmail(), request.getPassword(), ip, ua);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/google")
    public ResponseEntity<TokenResponse> loginGoogle(@RequestBody GoogleLoginRequest request, HttpServletRequest servletRequest) {
        String ip = getClientIp(servletRequest);
        String ua = servletRequest.getHeader("User-Agent");
        TokenResponse response = authService.socialLogin(request.getToken(), "google", ip, ua);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login/apple")
    public ResponseEntity<TokenResponse> loginApple(@RequestBody Map<String, String> request, HttpServletRequest servletRequest) {
        String email = request.get("email");
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("El correo es obligatorio para el login de Apple");
        }
        String ip = getClientIp(servletRequest);
        String ua = servletRequest.getHeader("User-Agent");
        // En Apple simulado enviamos el email en el parámetro token
        TokenResponse response = authService.socialLogin(email, "apple", ip, ua);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest request, HttpServletRequest servletRequest) {
        String ip = getClientIp(servletRequest);
        String ua = servletRequest.getHeader("User-Agent");
        TokenResponse response = authService.register(request, ip, ua);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-lockout")
    public ResponseEntity<Map<String, Object>> checkLockout(@RequestParam String email) {
        Map<String, Object> result = authService.checkLockout(email);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/verify")
    public ResponseEntity<Map<String, Object>> verify(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.findById(principal.getId())
                .orElseThrow(() -> new InvalidCredentialsException("Usuario no encontrado"));
        
        Map<String, Object> res = new HashMap<>();
        res.put("valid", true);
        res.put("user", UserMapper.toProfileResponse(user));
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@AuthenticationPrincipal UserPrincipal principal, HttpServletRequest servletRequest) {
        String ip = getClientIp(servletRequest);
        String ua = servletRequest.getHeader("User-Agent");
        
        auditService.logAuthEvent("LOGOUT", principal.getEmail(), principal.getId(),
                "", principal.getRole(), ip, ua, "Sesión cerrada por el usuario");

        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Sesión cerrada con éxito");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@AuthenticationPrincipal UserPrincipal principal) {
        String newToken = tokenService.generateToken(principal.getId(), principal.getEmail(), principal.getRole());
        return ResponseEntity.ok(Map.of("token", newToken));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        // Stub de recuperación de contraseña igual al de Python
        Map<String, String> res = new HashMap<>();
        res.put("status", "success");
        res.put("message", "Si el correo existe, se enviarán instrucciones");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/verify-password")
    public ResponseEntity<Map<String, Boolean>> verifyPasswordInternal(@Valid @RequestBody VerifyPasswordRequest request) {
        boolean valid = authService.verifyPasswordInternal(request.getUserId(), request.getPassword());
        if (!valid) {
            throw new InvalidCredentialsException("Contraseña incorrecta");
        }
        return ResponseEntity.ok(Map.of("valid", true));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // X-Forwarded-For puede contener múltiples IPs separadas por coma, tomamos la primera
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "N/A";
    }
}
