package com.laikaclub.tickets.dto;

public class CancellationRequestDto {
    private Long ticketId;
    private String reason;

    public CancellationRequestDto() {
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
