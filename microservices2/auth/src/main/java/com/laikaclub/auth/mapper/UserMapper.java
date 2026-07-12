package com.laikaclub.auth.mapper;

import com.laikaclub.auth.domain.PermissionRequest;
import com.laikaclub.auth.domain.User;
import com.laikaclub.auth.dto.response.PermissionRequestResponse;
import com.laikaclub.auth.dto.response.PublicProfileResponse;
import com.laikaclub.auth.dto.response.UserProfileResponse;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class UserMapper {

    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static UserProfileResponse toProfileResponse(User user) {
        if (user == null) return null;

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setProvider(user.getSocialProvider());
        
        if (user.getCreatedAt() != null) {
            response.setCreatedAt(user.getCreatedAt().format(formatter));
        }
        
        // El mapa de permisos se devuelve completo
        response.setPermissions(user.getPermissions());

        return response;
    }

    public static UserProfileResponse toLoginProfileResponse(User user) {
        if (user == null) return null;

        UserProfileResponse response = toProfileResponse(user);
        
        // En el login, por compatibilidad con el front, devolvemos los permisos como una lista de strings
        List<String> permissionList = new ArrayList<>();
        permissionList.add("admin.view");
        permissionList.add("venues.view");
        permissionList.add("cms.view");
        permissionList.add("stats.view");
        permissionList.add("users.view");
        permissionList.add("events.view");
        response.setPermissions(permissionList);

        return response;
    }

    public static PublicProfileResponse toPublicProfileResponse(User user) {
        if (user == null) return null;

        String fullName = (user.getFirstName() + " " + user.getLastName()).strip();
        if (fullName.isEmpty()) {
            fullName = user.getEmail().split("@")[0];
        }

        return new PublicProfileResponse(
                user.getId(),
                fullName,
                fullName,
                user.getRole()
        );
    }

    public static PermissionRequestResponse toPermissionRequestResponse(PermissionRequest request) {
        if (request == null) return null;

        String dateStr = request.getRequestDate() != null ? request.getRequestDate().format(formatter) : null;
        
        return new PermissionRequestResponse(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getEmail(),
                request.getPermissionType(),
                request.getStatus(),
                dateStr
        );
    }
}
