package com.shopstream.coreapi.admin;

import java.time.Instant;
import java.util.UUID;

import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserStatus;

public record AdminUserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        UserStatus status,
        Instant createdAt) {

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt());
    }
}