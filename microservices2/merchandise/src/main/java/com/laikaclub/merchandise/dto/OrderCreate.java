package com.laikaclub.merchandise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class OrderCreate {
    private List<OrderItemCreate> items;
    private Long userId;
    private String paymentMethod = "card";
    private String idempotencyKey;

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

    @JsonProperty("user_id")
    public void setUserIdSnake(Long userId) {
        if (userId != null) {
            this.userId = userId;
        }
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    @JsonProperty("payment_method")
    public void setPaymentMethodSnake(String paymentMethod) {
        if (paymentMethod != null) {
            this.paymentMethod = paymentMethod;
        }
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    @JsonProperty("idempotency_key")
    public void setIdempotencyKeySnake(String idempotencyKey) {
        if (idempotencyKey != null) {
            this.idempotencyKey = idempotencyKey;
        }
    }
}
