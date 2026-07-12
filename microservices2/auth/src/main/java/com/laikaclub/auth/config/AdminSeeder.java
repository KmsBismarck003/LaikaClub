package com.laikaclub.auth.config;

import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            long count = userRepository.count();
            if (count == 0) {
                logger.info("[AUTH SERVICE] La base de datos está vacía. Sembrando administrador inicial...");
                
                User admin = new User();
                admin.setFirstName("Admin");
                admin.setLastName("Root");
                admin.setEmail("admin@laikaclub.com");
                admin.setPasswordHash(passwordEncoder.encode("gearsof2"));
                admin.setRole("admin");
                admin.setStatus("active");

                Map<String, Boolean> permissions = new HashMap<>();
                permissions.put("canViewDashboard", true);
                permissions.put("canCreateEvents", true);
                permissions.put("canEditEvents", true);
                permissions.put("canViewEventAnalytics", true);
                permissions.put("canManageVenues", true);
                permissions.put("canManageUsers", true);
                admin.setPermissions(permissions);

                userRepository.save(admin);
                logger.info("[AUTH SERVICE] Administrador inicial sembrado exitosamente: admin@laikaclub.com / gearsof2");
            } else {
                logger.info("[AUTH SERVICE] La base de datos ya cuenta con usuarios registrados (Count: {}). Omitiendo sembrado.", count);
            }
        } catch (Exception e) {
            logger.error("[AUTH SERVICE] Error al verificar o sembrar administrador inicial", e);
        }
    }
}
