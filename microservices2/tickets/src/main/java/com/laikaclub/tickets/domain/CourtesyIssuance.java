package com.laikaclub.tickets.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courtesy_issuances")
public class CourtesyIssuance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "event_function_id")
    private Long eventFunctionId;

    @Column(name = "section_name")
    private String sectionName;

    @Column(name = "issuer_user_id", nullable = false)
    private Long issuerUserId;

    @Column(name = "issuer_email", nullable = false, length = 150)
    private String issuerEmail;

    @Column(name = "recipient_type", nullable = false, length = 50)
    private String recipientType;

    @Column(name = "motive", nullable = false, length = 255)
    private String motive;

    @Column(name = "delivery_method", nullable = false, length = 50)
    private String deliveryMethod; // DIRECT_EMAIL, CLAIM_CODE

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public CourtesyIssuance() {
    }

    public CourtesyIssuance(Long eventId, Long eventFunctionId, String sectionName,
                            Long issuerUserId, String issuerEmail,
                            String recipientType, String motive, String deliveryMethod, Integer quantity) {
        this.eventId = eventId;
        this.eventFunctionId = eventFunctionId;
        this.sectionName = sectionName;
        this.issuerUserId = issuerUserId;
        this.issuerEmail = issuerEmail;
        this.recipientType = recipientType;
        this.motive = motive;
        this.deliveryMethod = deliveryMethod;
        this.quantity = quantity;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getEventFunctionId() {
        return eventFunctionId;
    }

    public void setEventFunctionId(Long eventFunctionId) {
        this.eventFunctionId = eventFunctionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public Long getIssuerUserId() {
        return issuerUserId;
    }

    public void setIssuerUserId(Long issuerUserId) {
        this.issuerUserId = issuerUserId;
    }

    public String getIssuerEmail() {
        return issuerEmail;
    }

    public void setIssuerEmail(String issuerEmail) {
        this.issuerEmail = issuerEmail;
    }

    public String getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }

    public String getMotive() {
        return motive;
    }

    public void setMotive(String motive) {
        this.motive = motive;
    }

    public String getDeliveryMethod() {
        return deliveryMethod;
    }

    public void setDeliveryMethod(String deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
