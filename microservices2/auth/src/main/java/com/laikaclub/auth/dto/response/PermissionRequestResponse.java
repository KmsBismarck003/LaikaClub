package com.laikaclub.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class PermissionRequestResponse {

    private Long id;

    @JsonProperty("user_id")
    private Long userId;

    @JsonProperty("user_email")
    private String userEmail;

    @JsonProperty("permission_type")
    private String permissionType;

    private String status;

    @JsonProperty("request_date")
    private String requestDate;

    public PermissionRequestResponse() {}

    public PermissionRequestResponse(Long id, Long userId, String userEmail, String permissionType, String status, String requestDate) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.permissionType = permissionType;
        this.status = status;
        this.requestDate = requestDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
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

    public String getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(String requestDate) {
        this.requestDate = requestDate;
    }
}
