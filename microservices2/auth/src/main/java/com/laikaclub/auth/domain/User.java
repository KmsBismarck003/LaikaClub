package com.laikaclub.auth.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "first_name", length = 100)
    private String firstName = "";

    @Column(name = "last_name", length = 100)
    private String lastName = "";

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(length = 50)
    private String role = "usuario";

    @Column(length = 50)
    private String status = "active";

    @Column(name = "last_login", length = 100)
    private String lastLogin;

    @Column(name = "failed_attempts")
    private Integer failedAttempts = 0;

    @Column(name = "lockout_until", length = 100)
    private String lockoutUntil;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "social_provider", length = 50)
    private String socialProvider;

    @Column(name = "reset_token", length = 100)
    private String resetToken;

    @Column(name = "reset_token_expires", length = 100)
    private String resetTokenExpires;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = PermissionsConverter.class)
    private Map<String, Boolean> permissions = new HashMap<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (permissions == null || permissions.isEmpty()) {
            // Permisos por defecto
            permissions = new HashMap<>();
            permissions.put("canViewMyTickets", true);
            permissions.put("canViewMyHistory", true);
            permissions.put("canAccessCart", true);
            permissions.put("canViewAchievements", true);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(String lastLogin) {
        this.lastLogin = lastLogin;
    }

    public Integer getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(Integer failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public String getLockoutUntil() {
        return lockoutUntil;
    }

    public void setLockoutUntil(String lockoutUntil) {
        this.lockoutUntil = lockoutUntil;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getSocialProvider() {
        return socialProvider;
    }

    public void setSocialProvider(String socialProvider) {
        this.socialProvider = socialProvider;
    }

    public String getResetToken() {
        return resetToken;
    }

    public void setResetToken(String resetToken) {
        this.resetToken = resetToken;
    }

    public String getResetTokenExpires() {
        return resetTokenExpires;
    }

    public void setResetTokenExpires(String resetTokenExpires) {
        this.resetTokenExpires = resetTokenExpires;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Map<String, Boolean> getPermissions() {
        return permissions;
    }

    public void setPermissions(Map<String, Boolean> permissions) {
        this.permissions = permissions;
    }
}
