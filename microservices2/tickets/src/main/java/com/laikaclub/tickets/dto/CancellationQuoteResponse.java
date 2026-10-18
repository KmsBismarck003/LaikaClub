package com.laikaclub.tickets.dto;

public class CancellationQuoteResponse {
    private Long ticketId;
    private String ticketCode;
    private Long eventId;
    private String eventName;
    private String eventDate;
    private String seatInfo;
    private Double originalPrice;
    private Double refundAmount;
    private Double penaltyFee;
    private String paymentMethod;
    private boolean eligible;
    private String rejectionReason;
    private String policySummary;
    private String estimatedDays;

    public CancellationQuoteResponse() {
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getEventDate() {
        return eventDate;
    }

    public void setEventDate(String eventDate) {
        this.eventDate = eventDate;
    }

    public String getSeatInfo() {
        return seatInfo;
    }

    public void setSeatInfo(String seatInfo) {
        this.seatInfo = seatInfo;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public Double getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(Double refundAmount) {
        this.refundAmount = refundAmount;
    }

    public Double getPenaltyFee() {
        return penaltyFee;
    }

    public void setPenaltyFee(Double penaltyFee) {
        this.penaltyFee = penaltyFee;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getPolicySummary() {
        return policySummary;
    }

    public void setPolicySummary(String policySummary) {
        this.policySummary = policySummary;
    }

    public String getEstimatedDays() {
        return estimatedDays;
    }

    public void setEstimatedDays(String estimatedDays) {
        this.estimatedDays = estimatedDays;
    }
}
