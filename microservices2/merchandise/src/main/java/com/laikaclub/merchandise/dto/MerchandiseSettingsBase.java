package com.laikaclub.merchandise.dto;

import java.math.BigDecimal;

public class MerchandiseSettingsBase {
    private boolean isEnabled = false;
    private boolean activationFeePaid = false;
    private BigDecimal commissionPercentage = new BigDecimal("10.00");

    public boolean isIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(boolean isEnabled) {
        this.isEnabled = isEnabled;
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
}
