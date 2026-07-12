package com.laikaclub.auth.dto.response;

import java.util.Map;

public class PermissionResponse {

    private String role;
    private Map<String, Boolean> permissions;

    public PermissionResponse() {}

    public PermissionResponse(String role, Map<String, Boolean> permissions) {
        this.role = role;
        this.permissions = permissions;
    }

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
