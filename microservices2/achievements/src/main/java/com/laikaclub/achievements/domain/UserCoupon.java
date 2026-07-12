package com.laikaclub.achievements.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_coupons")
public class UserCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "coupon_type", length = 50)
    private String couponType = "";

    @Column(name = "discount_type", nullable = false, length = 20)
    private String discountType; // 'percentage', 'fixed', 'service_fee'

    @Column(name = "discount_value", nullable = false)
    private Double discountValue;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "uses_left")
    private Integer usesLeft = 1;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "is_permanent")
    private Integer isPermanent = 0; // 0 or 1

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Default constructor
    public UserCoupon() {}

    public UserCoupon(Long userId, String code, String discountType, Double discountValue, String description, Integer usesLeft, LocalDateTime expiresAt, Integer isPermanent) {
        this.userId = userId;
        this.code = code;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.description = description;
        this.usesLeft = usesLeft;
        this.expiresAt = expiresAt;
        this.isPermanent = isPermanent;
        this.couponType = "";
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getCouponType() { return couponType; }
    public void setCouponType(String couponType) { this.couponType = couponType; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getUsesLeft() { return usesLeft; }
    public void setUsesLeft(Integer usesLeft) { this.usesLeft = usesLeft; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public Integer getIsPermanent() { return isPermanent; }
    public void setIsPermanent(Integer isPermanent) { this.isPermanent = isPermanent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
