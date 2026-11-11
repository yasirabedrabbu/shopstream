package com.shopstream.coreapi.auth;

import java.time.Instant;
import java.util.UUID;

import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserStatus;

public record UserResponse(
        UUID id,
        String email,
        String fullName,
        Role role,
        UserStatus status,
        Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt());
    }
}