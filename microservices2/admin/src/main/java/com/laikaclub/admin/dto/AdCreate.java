package com.laikaclub.admin.dto;

import jakarta.validation.constraints.NotBlank;

public class AdCreate {

    @NotBlank(message = "El título es obligatorio")
    private String title;

    @NotBlank(message = "La URL de la imagen es obligatoria")
    private String imageUrl;

    private String linkUrl;
    private String position = "main";
    private boolean active = true;
    private Long eventId;

    public AdCreate() {}

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
}
