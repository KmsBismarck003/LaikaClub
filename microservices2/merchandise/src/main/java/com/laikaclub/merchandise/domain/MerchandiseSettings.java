package com.laikaclub.merchandise.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "merchandise_settings")
public class MerchandiseSettings {

    @Id
    @Column(name = "manager_id")
    private Long managerId;

    @Column(name = "is_enabled")
    private boolean isEnabled = false;

    @Column(name = "activation_fee_paid")
    private boolean activationFeePaid = false;

    @Column(name = "commission_percentage", precision = 5, scale = 2)
    private BigDecimal commissionPercentage = new BigDecimal("10.00");

    @Column(name = "enabled_at")
    private LocalDateTime enabledAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }

    public boolean isEnabled() {
        return isEnabled;
    }

    public void setEnabled(boolean enabled) {
        isEnabled = enabled;
    }

    public boolean isActivationFeePaid() {
        return activationFeePaid;
    }

    public void setActivationFeePaid(boolean activationFeePaid) {
        this.activationFeePaid = activationFeePaid;
    }

    public BigDecimal getCommissionPercentage() {
        return commissionPercentage;
    }

    public void setCommissionPercentage(BigDecimal commissionPercentage) {
        this.commissionPercentage = commissionPercentage;
    }

    public LocalDateTime getEnabledAt() {
        return enabledAt;
    }

    public void setEnabledAt(LocalDateTime enabledAt) {
        this.enabledAt = enabledAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
