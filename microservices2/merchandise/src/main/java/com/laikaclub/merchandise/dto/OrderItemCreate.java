package com.laikaclub.merchandise.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class OrderItemCreate {
    private Long variantId;
    private int quantity;

    public Long getVariantId() {
        return variantId;
    }

    public void setVariantId(Long variantId) {
        this.variantId = variantId;
    }

    @JsonProperty("variant_id")
    public void setVariantIdSnake(Long variantId) {
        if (variantId != null) {
            this.variantId = variantId;
        }
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
