package com.laikaclub.achievements.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class CouponValidationResponse {

    private boolean valid;
    
    private Double discount;

    @JsonProperty("discount_type")
    private String discountType;

    @JsonProperty("discount_value")
    private Double discountValue;

    private String description;

    private String detail;

    // Constructors
    public CouponValidationResponse() {}

    public static CouponValidationResponse invalid(String detail) {
        CouponValidationResponse resp = new CouponValidationResponse();
        resp.setValid(false);
        resp.setDetail(detail);
        return resp;
    }

    public static CouponValidationResponse valid(Double discount, String discountType, Double discountValue, String description) {
        CouponValidationResponse resp = new CouponValidationResponse();
        resp.setValid(true);
        resp.setDiscount(discount);
        resp.setDiscountType(discountType);
        resp.setDiscountValue(discountValue);
        resp.setDescription(description);
        return resp;
    }

    // Getters and Setters
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
}
