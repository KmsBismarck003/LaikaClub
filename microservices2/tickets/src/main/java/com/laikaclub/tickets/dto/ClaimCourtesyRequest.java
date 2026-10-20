package com.laikaclub.tickets.dto;

public class ClaimCourtesyRequest {

    private String claimToken;

    public ClaimCourtesyRequest() {
    }

    public ClaimCourtesyRequest(String claimToken) {
        this.claimToken = claimToken;
    }

    public String getClaimToken() {
        return claimToken;
    }

    public void setClaimToken(String claimToken) {
        this.claimToken = claimToken;
    }
}
