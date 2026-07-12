package com.laikaclub.achievements.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ValidateCouponRequest {

    @NotBlank
    @JsonProperty("coupon_code")
    private String couponCode;

    @NotNull
    @JsonProperty("subtotal")
    private Double subtotal;

    @JsonProperty("service_fee_percent")
    private Double serviceFeePercent = 10.0;

    // Getters and Setters
    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getServiceFeePercent() { return serviceFeePercent; }
    public void setServiceFeePercent(Double serviceFeePercent) { this.serviceFeePercent = serviceFeePercent; }
}
