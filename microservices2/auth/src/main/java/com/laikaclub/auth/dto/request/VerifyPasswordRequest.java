package com.laikaclub.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VerifyPasswordRequest {

    @NotNull(message = "El ID de usuario es obligatorio")
    @JsonProperty("user_id")
    private Long userId;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    // Getters and Setters
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
