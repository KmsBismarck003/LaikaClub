package com.laikaclub.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public class StatusUpdateRequest {

    @NotBlank(message = "El estado no puede estar vacío")
    private String status;

    // Getters and Setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
