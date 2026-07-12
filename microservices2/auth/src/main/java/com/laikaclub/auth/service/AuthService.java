package com.laikaclub.auth.service;

import com.laikaclub.auth.domain.PermissionRequest;
import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.dto.request.RegisterRequest;
import com.laikaclub.auth.dto.response.PermissionRequestResponse;
import com.laikaclub.auth.dto.response.TokenResponse;
import com.laikaclub.auth.exception.AccountLockedException;
import com.laikaclub.auth.exception.InvalidCredentialsException;
import com.laikaclub.auth.integration.GoogleAuthClient;
import com.laikaclub.auth.mapper.UserMapper;
import com.laikaclub.auth.repository.PermissionRequestRepository;
import com.laikaclub.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILED_ATTEMPTS = 3;
    private static final int LOCKOUT_DURATION_MINUTES = 10;
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    private final UserRepository userRepository;
    private final PermissionRequestRepository permissionRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AuditService auditService;
    private final MailService mailService;
    private final GoogleAuthClient googleAuthClient;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PermissionRequestRepository permissionRequestRepository,
                       PasswordEncoder passwordEncoder,
                       TokenService tokenService,
                       AuditService auditService,
                       MailService mailService,
                       GoogleAuthClient googleAuthClient) {
        this.userRepository = userRepository;
        this.permissionRequestRepository = permissionRequestRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.auditService = auditService;
        this.mailService = mailService;
        this.googleAuthClient = googleAuthClient;
    }

    @Transactional
    public TokenResponse login(String email, String password, String ip, String userAgent) {
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());

        if (userOpt.isEmpty()) {
            auditService.logAuthEvent("INTENTO_FALLIDO", email, null, "", "", ip, userAgent, "Usuario no encontrado");
            throw new InvalidCredentialsException("Credenciales inválidas");
        }

        User user = userOpt.get();

        // Verificar Bloqueo
        if (user.getLockoutUntil() != null) {
            try {
                LocalDateTime lockoutTime = LocalDateTime.parse(user.getLockoutUntil(), DateTimeFormatter.ISO_DATE_TIME);
                long remainingSeconds = Duration.between(LocalDateTime.now(), lockoutTime).getSeconds();
                if (remainingSeconds > 0) {
                    auditService.logAuthEvent("INTENTO_FALLIDO", email, user.getId(), 
                            user.getFirstName() + " " + user.getLastName(), user.getRole(), ip, userAgent, 
                            "Intento de login en cuenta bloqueada");
                    throw new AccountLockedException("Cuenta bloqueada temporalmente", (int) remainingSeconds);
                } else {
                    // Lockout expirado
                    user.setLockoutUntil(null);
                    user.setFailedAttempts(0);
                    if ("blocked".equals(user.getStatus())) {
                        user.setStatus("active");
                    }
                    userRepository.save(user);
                }
            } catch (Exception e) {
                logger.error("Error al parsear lockout_until del usuario: {}", user.getLockoutUntil(), e);
            }
        }

        // Verificar Contraseña
        if (user.getPasswordHash() == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            // Incrementar intentos fallidos (Bypass para administradores raíz)
            if (!"admin".equalsIgnoreCase(user.getRole())) {
                int attempts = user.getFailedAttempts() + 1;
                user.setFailedAttempts(attempts);
                
                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    LocalDateTime lockoutEnd = LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES);
                    user.setLockoutUntil(lockoutEnd.format(formatter));
                    user.setStatus("blocked");
                    userRepository.save(user);
                    
                    auditService.logAuthEvent("CUENTA_BLOQUEADA", email, user.getId(),
                            user.getFirstName() + " " + user.getLastName(), user.getRole(), ip, userAgent,
                            "Cuenta bloqueada por 10 minutos tras 3 intentos fallidos");
                    
                    throw new AccountLockedException("Cuenta bloqueada temporalmente", LOCKOUT_DURATION_MINUTES * 60);
                } else {
                    userRepository.save(user);
                    auditService.logAuthEvent("INTENTO_FALLIDO", email, user.getId(),
                            user.getFirstName() + " " + user.getLastName(), user.getRole(), ip, userAgent,
                            "Contraseña incorrecta. Intento " + attempts + "/" + MAX_FAILED_ATTEMPTS);
                    
                    throw new InvalidCredentialsException("Credenciales inválidas", attempts, MAX_FAILED_ATTEMPTS);
                }
            } else {
                auditService.logAuthEvent("INTENTO_FALLIDO", email, user.getId(),
                        user.getFirstName() + " " + user.getLastName(), user.getRole(), ip, userAgent,
                        "Contraseña incorrecta para Administrador");
                throw new InvalidCredentialsException("Credenciales inválidas");
            }
        }

        // Login Exitoso
        user.setFailedAttempts(0);
        user.setLockoutUntil(null);
        user.setLastLogin(LocalDateTime.now().format(formatter));
        if ("blocked".equals(user.getStatus())) {
            user.setStatus("active");
        }
        userRepository.save(user);

        auditService.logAuthEvent("LOGIN_EXITOSO", email, user.getId(),
                user.getFirstName() + " " + user.getLastName(), user.getRole(), ip, userAgent,
                "Inicio de sesión local exitoso");

        // Enviar alerta asíncrona
        mailService.sendLoginAlert(email, user.getFirstName(), LocalDateTime.now().format(formatter), "Local");

        String token = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new TokenResponse(token, UserMapper.toLoginProfileResponse(user));
    }

    @Transactional
    public TokenResponse socialLogin(String token, String provider, String ip, String userAgent) {
        String email = "";
        String firstName = "User";
        String lastName = provider.substring(0, 1).toUpperCase() + provider.substring(1);

        if ("google".equalsIgnoreCase(provider)) {
            Map<String, String> googleInfo = googleAuthClient.verifyToken(token);
            if (googleInfo == null) {
                throw new InvalidCredentialsException("Token de Google inválido o expirado");
            }
            email = googleInfo.get("email");
            firstName = googleInfo.getOrDefault("given_name", "User");
            lastName = googleInfo.getOrDefault("family_name", "Google");
        } else {
            // Simulación de Apple (u otros)
            email = token;
        }

        email = email.toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        User user;

        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            // Crear usuario nuevo social
            user = new User();
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setRole("usuario");
            user.setStatus("active");
            user.setSocialProvider(provider);
            user = userRepository.save(user);
            
            auditService.logAuthEvent("REGISTRO_NUEVO", email, user.getId(),
                    firstName + " " + lastName, "usuario", ip, userAgent,
                    "Registro nuevo vía login social (" + provider + ")");
        }

        user.setLastLogin(LocalDateTime.now().format(formatter));
        userRepository.save(user);

        auditService.logAuthEvent("LOGIN_EXITOSO", email, user.getId(),
                user.getFirstName() + " " + user.getLastName(), user.getRole(), ip, userAgent,
                "Inicio de sesión exitoso vía social (" + provider + ")");

        // Alerta asíncrona
        mailService.sendLoginAlert(email, user.getFirstName(), LocalDateTime.now().format(formatter), provider.toUpperCase());

        String jwtToken = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new TokenResponse(jwtToken, UserMapper.toProfileResponse(user));
    }

    @Transactional
    public TokenResponse register(RegisterRequest request, String ip, String userAgent) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(email);
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("usuario");
        user.setStatus("active");
        user = userRepository.save(user);

        auditService.logAuthEvent("REGISTRO_NUEVO", email, user.getId(),
                user.getFirstName() + " " + user.getLastName(), user.getRole(), ip, userAgent,
                "Registro exitoso de usuario local");

        // Alerta de Login Inmediato
        mailService.sendLoginAlert(email, user.getFirstName(), LocalDateTime.now().format(formatter), "Local");

        String token = tokenService.generateToken(user.getId(), user.getEmail(), user.getRole());
        return new TokenResponse(token, UserMapper.toLoginProfileResponse(user));
    }

    @Transactional
    public void requestPermission(Long userId, String permissionType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        PermissionRequest request = new PermissionRequest();
        request.setUser(user);
        request.setPermissionType(permissionType);
        request.setStatus("pending");
        permissionRequestRepository.save(request);
    }

    public List<PermissionRequestResponse> getAllPermissionRequests() {
        return permissionRequestRepository.findByStatus("pending").stream()
                .map(UserMapper::toPermissionRequestResponse)
                .collect(Collectors.toList());
    }

    public Map<String, Object> checkLockout(String email) {
        Map<String, Object> res = new HashMap<>();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email.trim());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getLockoutUntil() != null) {
                try {
                    LocalDateTime lockoutTime = LocalDateTime.parse(user.getLockoutUntil(), DateTimeFormatter.ISO_DATE_TIME);
                    long remainingSeconds = Duration.between(LocalDateTime.now(), lockoutTime).getSeconds();
                    if (remainingSeconds > 0) {
                        res.put("locked", true);
                        res.put("retry_after", remainingSeconds);
                        res.put("failed_attempts", user.getFailedAttempts());
                        return res;
                    }
                } catch (Exception e) {
                    logger.error("Error parseando lockout_until", e);
                }
            }
            res.put("locked", false);
            res.put("retry_after", 0);
            res.put("failed_attempts", user.getFailedAttempts());
        } else {
            // Seguridad: simular estado no bloqueado
            res.put("locked", false);
            res.put("retry_after", 0);
            res.put("failed_attempts", 0);
        }
        return res;
    }

    public boolean verifyPasswordInternal(Long userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return user.getPasswordHash() != null && passwordEncoder.matches(password, user.getPasswordHash());
    }
}
