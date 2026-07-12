package com.laikaclub.events.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "venue_rooms")
public class VenueRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "venue_id", nullable = false)
    private Long venueId;

    @Column(nullable = false)
    private String name;

    private Integer capacity;

    private String status = "active";

    @Column(name = "layout_mode")
    private String layoutMode = "map";

    @Column(name = "layout_metadata", columnDefinition = "TEXT")
    private String layoutMetadata;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLayoutMode() {
        return layoutMode;
    }

    public void setLayoutMode(String layoutMode) {
        this.layoutMode = layoutMode;
    }

    public String getLayoutMetadata() {
        return layoutMetadata;
    }

    public void setLayoutMetadata(String layoutMetadata) {
        this.layoutMetadata = layoutMetadata;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
