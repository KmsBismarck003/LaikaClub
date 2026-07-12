package com.laikaclub.auth.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "permission_requests")
public class PermissionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "permission_type", length = 100, nullable = false)
    private String permissionType;

    @Column(length = 50, nullable = false)
    private String status = "pending";

    @Column(name = "request_date")
    private LocalDateTime requestDate;

    @PrePersist
    protected void onCreate() {
        if (requestDate == null) {
            requestDate = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getPermissionType() {
        return permissionType;
    }

    public void setPermissionType(String permissionType) {
        this.permissionType = permissionType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }
}
