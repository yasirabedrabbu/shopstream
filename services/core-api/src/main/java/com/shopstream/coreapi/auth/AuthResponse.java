package com.shopstream.coreapi.auth;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String refreshToken,
        UserResponse user) {
}