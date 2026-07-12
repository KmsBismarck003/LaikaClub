package com.laikaclub.achievements.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class IncentivesResponse {

    private String status;

    @JsonProperty("processed_users")
    private Integer processedUsers;

    @JsonProperty("incentives_created_count")
    private Integer incentivesCreatedCount;

    private List<IncentiveDetail> incentives;

    // Constructors
    public IncentivesResponse() {}

    public IncentivesResponse(String status, Integer processedUsers, Integer incentivesCreatedCount, List<IncentiveDetail> incentives) {
        this.status = status;
        this.processedUsers = processedUsers;
        this.incentivesCreatedCount = incentivesCreatedCount;
        this.incentives = incentives;
    }

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getProcessedUsers() { return processedUsers; }
    public void setProcessedUsers(Integer processedUsers) { this.processedUsers = processedUsers; }

    public Integer getIncentivesCreatedCount() { return incentivesCreatedCount; }
    public void setIncentivesCreatedCount(Integer incentivesCreatedCount) { this.incentivesCreatedCount = incentivesCreatedCount; }

    public List<IncentiveDetail> getIncentives() { return incentives; }
    public void setIncentives(List<IncentiveDetail> incentives) { this.incentives = incentives; }
}
