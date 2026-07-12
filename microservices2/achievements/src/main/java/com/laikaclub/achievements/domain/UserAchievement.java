package com.laikaclub.achievements.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_achievements")
public class UserAchievement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "achievement_id", nullable = false)
    private Integer achievementId;

    @Column(name = "tier", nullable = false)
    private Integer tier;

    @Column(name = "tier_name", length = 100)
    private String tierName;

    @Column(name = "phase", length = 50)
    private String phase;

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt = LocalDateTime.now();

    // Default constructor
    public UserAchievement() {}

    public UserAchievement(Long userId, Integer achievementId, Integer tier, String tierName, String phase) {
        this.userId = userId;
        this.achievementId = achievementId;
        this.tier = tier;
        this.tierName = tierName;
        this.phase = phase;
        this.unlockedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getAchievementId() { return achievementId; }
    public void setAchievementId(Integer achievementId) { this.achievementId = achievementId; }

    public Integer getTier() { return tier; }
    public void setTier(Integer tier) { this.tier = tier; }

    public String getTierName() { return tierName; }
    public void setTierName(String tierName) { this.tierName = tierName; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public LocalDateTime getUnlockedAt() { return unlockedAt; }
    public void setUnlockedAt(LocalDateTime unlockedAt) { this.unlockedAt = unlockedAt; }
}
