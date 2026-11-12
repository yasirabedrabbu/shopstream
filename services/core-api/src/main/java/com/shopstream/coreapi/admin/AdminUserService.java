package com.shopstream.coreapi.admin;

import java.util.Locale;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.auth.RefreshTokenRepository;
import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;
import com.shopstream.coreapi.user.UserStatus;

@Service
public class AdminUserService {

    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;

    public AdminUserService(UserRepository users, RefreshTokenRepository refreshTokens) {
        this.users = users;
        this.refreshTokens = refreshTokens;
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> list(Role role, UserStatus status, String search, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> cb.conjunction();
        if (role != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("role"), role));
        }
        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (search != null && !search.isBlank()) {
            String like = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("fullName")), like)));
        }
        return users.findAll(spec, pageable).map(AdminUserResponse::from);
    }

    @Transactional
    public AdminUserResponse changeStatus(UUID actorId, UUID targetId, UserStatus status) {
        User user = users.findById(targetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getId().equals(actorId)) {
            throw new ApiException(HttpStatus.CONFLICT, "You cannot change your own status");
        }
        if (user.getRole() == Role.ADMIN) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Admin accounts cannot be suspended here");
        }
        user.setStatus(status);
        if (status != UserStatus.ACTIVE) {
            // Kill every refresh token. The access token still lives until it expires (max 60 minutes).
            refreshTokens.revokeAllForUser(user.getId());
        }
        return AdminUserResponse.from(user);
    }
}