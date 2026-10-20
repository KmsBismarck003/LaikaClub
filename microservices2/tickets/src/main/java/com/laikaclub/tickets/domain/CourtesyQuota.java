package com.laikaclub.tickets.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "courtesy_quotas")
public class CourtesyQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "manager_user_id", nullable = false)
    private Long managerUserId;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "event_function_id")
    private Long eventFunctionId;

    @Column(name = "section_name")
    private String sectionName;

    @Column(name = "max_allowed", nullable = false)
    private Integer maxAllowed = 0;

    @Column(name = "issued_count", nullable = false)
    private Integer issuedCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public CourtesyQuota() {
    }

    public CourtesyQuota(Long managerUserId, Long eventId, Integer maxAllowed) {
        this.managerUserId = managerUserId;
        this.eventId = eventId;
        this.maxAllowed = maxAllowed;
        this.issuedCount = 0;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getManagerUserId() {
        return managerUserId;
    }

    public void setManagerUserId(Long managerUserId) {
        this.managerUserId = managerUserId;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getEventFunctionId() {
        return eventFunctionId;
    }

    public void setEventFunctionId(Long eventFunctionId) {
        this.eventFunctionId = eventFunctionId;
    }

    public String getSectionName() {
        return sectionName;
    }

    public void setSectionName(String sectionName) {
        this.sectionName = sectionName;
    }

    public Integer getMaxAllowed() {
        return maxAllowed;
    }

    public void setMaxAllowed(Integer maxAllowed) {
        this.maxAllowed = maxAllowed;
    }

    public Integer getIssuedCount() {
        return issuedCount;
    }

    public void setIssuedCount(Integer issuedCount) {
        this.issuedCount = issuedCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
