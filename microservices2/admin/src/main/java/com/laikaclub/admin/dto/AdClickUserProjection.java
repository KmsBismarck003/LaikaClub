package com.laikaclub.admin.dto;

import java.time.LocalDateTime;

public interface AdClickUserProjection {
    LocalDateTime getClickedAt();
    Long getUserId();
    String getFullName();
    String getEmail();
    String getProfileImage();
}
