package com.laikaclub.admin.dto;

import com.laikaclub.admin.domain.Ad;
import java.time.LocalDateTime;

public class AdAdminDto {
    private Long id;
    private String title;
    private String imageUrl;
    private String linkUrl;
    private String position;
    private boolean active;
    private Long eventId;
    private LocalDateTime createdAt;
    private long clickCount;

    public AdAdminDto() {}

    public AdAdminDto(Ad ad, long clickCount) {
        this.id = ad.getId();
        this.title = ad.getTitle();
        this.imageUrl = ad.getImageUrl();
        this.linkUrl = ad.getLinkUrl();
        this.position = ad.getPosition();
        this.active = ad.getActive() != null ? ad.getActive() : false;
        this.eventId = ad.getEventId();
        this.createdAt = ad.getCreatedAt();
        this.clickCount = clickCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public long getClickCount() {
        return clickCount;
    }

    public void setClickCount(long clickCount) {
        this.clickCount = clickCount;
    }
}
