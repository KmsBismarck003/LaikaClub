package com.laikaclub.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PublicProfileResponse {

    private Long id;
    private String name;

    @JsonProperty("full_name")
    private String fullName;

    private String role;

    public PublicProfileResponse() {}

    public PublicProfileResponse(Long id, String name, String fullName, String role) {
        this.id = id;
        this.name = name;
        this.fullName = fullName;
        this.role = role;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
