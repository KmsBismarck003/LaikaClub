package com.laikaclub.auth.dto.response;

public class TokenResponse {

    private String token;
    private UserProfileResponse user;

    public TokenResponse() {}

    public TokenResponse(String token, UserProfileResponse user) {
        this.token = token;
        this.user = user;
    }

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public UserProfileResponse getUser() {
        return user;
    }

    public void setUser(UserProfileResponse user) {
        this.user = user;
    }
}
