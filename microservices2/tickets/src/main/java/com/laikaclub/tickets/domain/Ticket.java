package com.laikaclub.tickets.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "ticket_code", unique = true, nullable = false)
    private String ticketCode;

    @Column(name = "qr_data", columnDefinition = "TEXT")
    private String qrData;

    @Column(name = "section_name")
    private String sectionName;

    @Column(name = "seat_id")
    private String seatId;

    @Column(nullable = false)
    private Double price = 0.0;

    @Column(nullable = false)
    private String status = "active";

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "redeemed_at")
    private String redeemedAt;

    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "event_function_id")
    private Long eventFunctionId;

    @Column(name = "is_courtesy")
    private Boolean isCourtesy = false;

    @Column(name = "courtesy_issuance_id")
    private Long courtesyIssuanceId;

    @Column(name = "claim_token", length = 64)
    private String claimToken;

    @Column(name = "recipient_type", length = 50)
    private String recipientType;

    @Column(name = "courtesy_motive", length = 255)
    private String courtesyMotive;

    @Column(name = "holder_name", length = 150)
    private String holderName;

    @Column(name = "holder_email", length = 150)
    private String holderEmail;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public String getQrData() {
        return qrData;
    }

    public void setQrData(String qrData) {
        this.qrData = qrData;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public String getSeatId() {
        return seatId;
    }

    public void setSeatId(String seatId) {
        this.seatId = seatId;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getRedeemedAt() {
        return redeemedAt;
    }

    public void setRedeemedAt(String redeemedAt) {
        this.redeemedAt = redeemedAt;
    }

    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getEventFunctionId() {
        return eventFunctionId;
    }

    public void setEventFunctionId(Long eventFunctionId) {
        this.eventFunctionId = eventFunctionId;
    }

    public Boolean getIsCourtesy() {
        return isCourtesy != null ? isCourtesy : false;
    }

    public void setIsCourtesy(Boolean isCourtesy) {
        this.isCourtesy = isCourtesy;
    }

    public Long getCourtesyIssuanceId() {
        return courtesyIssuanceId;
    }

    public void setCourtesyIssuanceId(Long courtesyIssuanceId) {
        this.courtesyIssuanceId = courtesyIssuanceId;
    }

    public String getClaimToken() {
        return claimToken;
    }

    public void setClaimToken(String claimToken) {
        this.claimToken = claimToken;
    }

    public String getRecipientType() {
        return recipientType;
    }

    public void setRecipientType(String recipientType) {
        this.recipientType = recipientType;
    }

    public String getCourtesyMotive() {
        return courtesyMotive;
    }

    public void setCourtesyMotive(String courtesyMotive) {
        this.courtesyMotive = courtesyMotive;
    }

    public String getHolderName() {
        return holderName;
    }

    public void setHolderName(String holderName) {
        this.holderName = holderName;
    }

    public String getHolderEmail() {
        return holderEmail;
    }

    public void setHolderEmail(String holderEmail) {
        this.holderEmail = holderEmail;
    }
}
