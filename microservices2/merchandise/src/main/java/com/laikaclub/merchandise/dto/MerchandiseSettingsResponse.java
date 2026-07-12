package com.laikaclub.merchandise.dto;

import java.time.LocalDateTime;

public class MerchandiseSettingsResponse extends MerchandiseSettingsBase {
    private Long managerId;
    private LocalDateTime enabledAt;

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public LocalDateTime getEnabledAt() {
        return enabledAt;
    }

    public void setEnabledAt(LocalDateTime enabledAt) {
        this.enabledAt = enabledAt;
    }
}
