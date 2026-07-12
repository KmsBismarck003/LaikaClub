package com.laikaclub.admin.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "backup_history")
public class BackupHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "backup_id", unique = true, nullable = false)
    private String backupId;

    @Column(name = "type")
    private String type;

    @Column(name = "status")
    private String status;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "size_mb")
    private Double sizeMb;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    public BackupHistory() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBackupId() {
        return backupId;
    }

    public void setBackupId(String backupId) {
        this.backupId = backupId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(LocalDateTime scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Double getSizeMb() {
        return sizeMb;
    }

    public void setSizeMb(Double sizeMb) {
        this.sizeMb = sizeMb;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
}
