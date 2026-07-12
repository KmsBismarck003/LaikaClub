package com.laikaclub.admin.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ad_clicks")
public class AdClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ad_id", nullable = false)
    private Long adId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "clicked_at", insertable = false, updatable = false)
    private LocalDateTime clickedAt;

    public AdClick() {}

    public AdClick(Long adId, Long userId) {
        this.adId = adId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAdId() {
        return adId;
    }

    public void setAdId(Long adId) {
        this.adId = adId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getClickedAt() {
        return clickedAt;
    }

    public void setClickedAt(LocalDateTime clickedAt) {
        this.clickedAt = clickedAt;
    }
}
