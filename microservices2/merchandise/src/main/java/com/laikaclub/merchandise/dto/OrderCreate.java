package com.laikaclub.merchandise.dto;

import java.util.List;

public class OrderCreate {
    private List<OrderItemCreate> items;
    private Long userId;
    private String paymentMethod = "card";
    private String idempotencyKey;

    // Getters and Setters
    public List<OrderItemCreate> getItems() {
        return items;
    }

    public void setItems(List<OrderItemCreate> items) {
        this.items = items;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }
}
