package com.laikaclub.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.Map;

public class UpdatePermissionsRequest {

    @NotBlank(message = "El rol es obligatorio")
    private String role;

    private Map<String, Boolean> permissions;

    // Getters and Setters
    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Map<String, Boolean> getPermissions() {
        return permissions;
    }

    public void setPermissions(Map<String, Boolean> permissions) {
        this.permissions = permissions;
    }
}
