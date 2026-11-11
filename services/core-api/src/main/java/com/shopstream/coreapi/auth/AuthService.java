package com.shopstream.coreapi.auth;

import java.time.Instant;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.notification.EmailService;
import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;
import com.shopstream.coreapi.user.UserStatus;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordResetTokenRepository resetTokens;
    private final EmailService emailService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder,
            TokenService tokenService, RefreshTokenRepository refreshTokens,
            PasswordResetTokenRepository resetTokens, EmailService emailService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
        this.refreshTokens = refreshTokens;
        this.resetTokens = resetTokens;
        this.emailService = emailService;
    }

    @Transactional
    public User register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        Role role = request.role() == null ? Role.CUSTOMER : request.role();

        if (role == Role.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot register as ADMIN");
        }
        if (users.existsByEmailIgnoreCase(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                role);
        return users.save(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(AuthService::invalidCredentials);

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is suspended");
        }

        return issueTokenPair(user);
    }

    /**
     * Exchange a valid refresh token for a new access + refresh token pair.
     * The old refresh token is revoked (rotation).
     */
    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        String hash = TokenService.hash(rawRefreshToken);
        RefreshToken stored = refreshTokens.findByTokenHash(hash)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (stored.isRevoked() || stored.isExpired()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token expired or revoked");
        }

        User user = users.findById(stored.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Account is suspended");
        }

        // Rotate: revoke the old token and issue a new pair.
        stored.revoke();
        return issueTokenPair(user);
    }

    /** Revoke the supplied refresh token. The access token stays valid until it expires (max 60 min). */
    @Transactional
    public void logout(String rawRefreshToken) {
        String hash = TokenService.hash(rawRefreshToken);
        refreshTokens.findByTokenHash(hash).ifPresent(RefreshToken::revoke);
    }

    /** Revoke all refresh tokens for a user. Called by admin suspend or password change. */
    @Transactional
    public void logoutAll(UUID userId) {
        refreshTokens.revokeAllForUser(userId);
    }

    /**
     * Send a password reset email. Always returns 200 (no user enumeration).
     * Rate limiting is at the HTTP level (LoginRateLimitFilter covers /auth/**).
     */
    @Transactional
    public void requestPasswordReset(String email) {
        users.findByEmailIgnoreCase(email.trim().toLowerCase()).ifPresent(user -> {
            // Invalidate any old unused tokens first.
            resetTokens.expireAllForUser(user.getId());

            String raw = tokenService.generateRefreshToken(); // same RNG, different purpose
            String hash = TokenService.hash(raw);
            Instant expiresAt = Instant.now().plusSeconds(3600); // 1 hour
            resetTokens.save(new PasswordResetToken(user.getId(), hash, expiresAt));

            emailService.send(
                    user.getEmail(),
                    "Reset your ShopStream password",
                    "Use this token to reset your password (valid for 1 hour):\n\n" + raw
                            + "\n\nPOST /api/v1/auth/password-reset/confirm with "
                            + "{\"token\":\"" + raw + "\",\"newPassword\":\"...\"}"
                            + "\n\nIf you did not request this, ignore this email.");
        });
    }

    @Transactional
    public void confirmPasswordReset(String rawToken, String newPassword) {
        String hash = TokenService.hash(rawToken);
        PasswordResetToken token = resetTokens.findByTokenHash(hash)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (token.isUsed() || token.isExpired()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        User user = users.findById(token.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        token.markUsed();

        // Revoke all refresh tokens so existing sessions end.
        refreshTokens.revokeAllForUser(user.getId());
    }

    // ---------- helpers ----------

    private AuthResponse issueTokenPair(User user) {
        TokenService.IssuedToken access = tokenService.issue(user);

        String rawRefresh = tokenService.generateRefreshToken();
        String hash = TokenService.hash(rawRefresh);
        Instant expiresAt = Instant.now().plusSeconds(tokenService.refreshTtlSeconds());
        refreshTokens.save(new RefreshToken(user.getId(), hash, expiresAt));

        return new AuthResponse(access.value(), "Bearer", access.expiresInSeconds(),
                rawRefresh, UserResponse.from(user));
    }

    private static ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
}