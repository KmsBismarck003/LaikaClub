package com.laikaclub.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class PermissionRequestDto {

    @NotBlank(message = "El tipo de permiso es obligatorio")
    @JsonProperty("permission_type")
    private String permissionType;

    // Getters and Setters
    public String getPermissionType() {
        return permissionType;
    }

    public void setPermissionType(String permissionType) {
        this.permissionType = permissionType;
    }
}
