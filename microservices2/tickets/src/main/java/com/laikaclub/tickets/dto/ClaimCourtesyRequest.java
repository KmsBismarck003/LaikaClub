package com.laikaclub.tickets.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ClaimCourtesyRequest {

    @JsonProperty("claimToken")
    @JsonAlias({"claim_token", "token"})
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
