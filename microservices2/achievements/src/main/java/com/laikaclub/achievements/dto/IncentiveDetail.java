package com.laikaclub.achievements.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class IncentiveDetail {

    @JsonProperty("user_id")
    private Long userId;

    private String email;

    private String campaign;

    private String code;

    private String benefit;

    // Constructors
    public IncentiveDetail() {}

    public IncentiveDetail(Long userId, String email, String campaign, String code, String benefit) {
        this.userId = userId;
        this.email = email;
        this.campaign = campaign;
        this.code = code;
        this.benefit = benefit;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCampaign() { return campaign; }
    public void setCampaign(String campaign) { this.campaign = campaign; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getBenefit() { return benefit; }
    public void setBenefit(String benefit) { this.benefit = benefit; }
}
