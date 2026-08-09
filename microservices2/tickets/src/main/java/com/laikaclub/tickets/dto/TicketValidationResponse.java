package com.laikaclub.tickets.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TicketValidationResponse {

    private boolean valid;
    private boolean actionable;
    private boolean isError;
    private boolean alreadyUsed;
    private String statusCode;
    private String statusTitle;
    private String operatorMessage;
    private String message;
    private long timeRemainingSeconds;

    // Compatibilidad retroactiva completa con entidad Ticket
    private Long id;
    private Long ticketId;
    private Long userId;
    private Long eventId;
    private Long eventFunctionId;
    private String ticketCode;
    private String eventName;
    private String customerName;
    private String ticketType;
    private String purchaseDate;
    private String status;
    private String sectionName;
    private String seatId;
    private Double price;
    private String paymentMethod;
    private String redeemedAt;

    private Map<String, Object> ticketDetails;
    private Map<String, Object> eventDetails;
    private Map<String, Object> terminalContext;
    private List<Map<String, Object>> redemptionHistory;

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public boolean isActionable() {
        return actionable;
    }

    public void setActionable(boolean actionable) {
        this.actionable = actionable;
    }

    public boolean isIsError() {
        return isError;
    }

    public void setIsError(boolean isError) {
        this.isError = isError;
    }

    public boolean isAlreadyUsed() {
        return alreadyUsed;
    }

    public void setAlreadyUsed(boolean alreadyUsed) {
        this.alreadyUsed = alreadyUsed;
    }

    public String getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(String statusCode) {
        this.statusCode = statusCode;
    }

    public String getStatusTitle() {
        return statusTitle;
    }

    public void setStatusTitle(String statusTitle) {
        this.statusTitle = statusTitle;
    }

    public String getOperatorMessage() {
        return operatorMessage;
    }

    public void setOperatorMessage(String operatorMessage) {
        this.operatorMessage = operatorMessage;
        this.message = operatorMessage;
    }

    public String getMessage() {
        return message != null ? message : operatorMessage;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getTimeRemainingSeconds() {
        return timeRemainingSeconds;
    }

    public void setTimeRemainingSeconds(long timeRemainingSeconds) {
        this.timeRemainingSeconds = timeRemainingSeconds;
    }

    public Long getId() {
        return id != null ? id : ticketId;
    }

    public void setId(Long id) {
        this.id = id;
        this.ticketId = id;
    }

    public Long getTicketId() {
        return ticketId != null ? ticketId : id;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
        this.id = ticketId;
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

    public Long getEventFunctionId() {
        return eventFunctionId;
    }

    public void setEventFunctionId(Long eventFunctionId) {
        this.eventFunctionId = eventFunctionId;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getTicketType() {
        return ticketType;
    }

    public void setTicketType(String ticketType) {
        this.ticketType = ticketType;
    }

    public String getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(String purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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

    public Map<String, Object> getTicketDetails() {
        return ticketDetails;
    }

    public void setTicketDetails(Map<String, Object> ticketDetails) {
        this.ticketDetails = ticketDetails;
    }

    public Map<String, Object> getEventDetails() {
        return eventDetails;
    }

    public void setEventDetails(Map<String, Object> eventDetails) {
        this.eventDetails = eventDetails;
    }

    public Map<String, Object> getTerminalContext() {
        return terminalContext;
    }

    public void setTerminalContext(Map<String, Object> terminalContext) {
        this.terminalContext = terminalContext;
    }

    public List<Map<String, Object>> getRedemptionHistory() {
        return redemptionHistory;
    }

    public void setRedemptionHistory(List<Map<String, Object>> redemptionHistory) {
        this.redemptionHistory = redemptionHistory;
    }
}

