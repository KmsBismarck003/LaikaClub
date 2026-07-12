package com.laikaclub.merchandise.dto;

public class OrderItemCreate {
    private Long variantId;
    private int quantity;

    // Getters and Setters
    public Long getVariantId() {
        return variantId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
