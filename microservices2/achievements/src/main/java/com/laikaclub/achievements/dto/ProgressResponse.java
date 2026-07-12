package com.laikaclub.achievements.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.laikaclub.achievements.domain.UserAchievement;

import java.util.List;

public class ProgressResponse {

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("ticket_count")
    private Integer ticketCount;

    @JsonProperty("total_points")
    private Integer totalPoints;

    private Integer tier;

    private List<UserAchievement> achievements;

    // Constructors
    public ProgressResponse() {}

    public ProgressResponse(Long userId, Integer ticketCount, Integer tier, List<UserAchievement> achievements) {
        this.userId = userId;
        this.ticketCount = ticketCount;
        this.totalPoints = ticketCount * 100;
        this.tier = tier;
        this.achievements = achievements;
    }

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getTicketCount() { return ticketCount; }
    public void setTicketCount(Integer ticketCount) { this.ticketCount = ticketCount; }

    public Integer getTotalPoints() { return totalPoints; }
    public void setTotalPoints(Integer totalPoints) { this.totalPoints = totalPoints; }

    public Integer getTier() { return tier; }
    public void setTier(Integer tier) { this.tier = tier; }

    public List<UserAchievement> getAchievements() { return achievements; }
    public void setAchievements(List<UserAchievement> achievements) { this.achievements = achievements; }
}
