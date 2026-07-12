package com.laikaclub.tickets.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class TicketPurchase {
    private List<TicketItem> items;
    private String paymentMethod;
    private String paymentId;
    private String shippingMethod;
    private Object shippingInfo;

    // Getters and Setters
    public List<TicketItem> getItems() {
        return items;
    }

    public void setItems(List<TicketItem> items) {
        this.items = items;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(String paymentId) {
        this.paymentId = paymentId;
    }

    public String getShippingMethod() {
        return shippingMethod;
    }

    public void setShippingMethod(String shippingMethod) {
        this.shippingMethod = shippingMethod;
    }

    public Object getShippingInfo() {
        return shippingInfo;
    }

    public void setShippingInfo(Object shippingInfo) {
        this.shippingInfo = shippingInfo;
    }
}
