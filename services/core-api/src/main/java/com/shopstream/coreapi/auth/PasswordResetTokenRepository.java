package com.shopstream.coreapi.auth;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    /** Invalidate any unused reset tokens for a user (password changed, new request issued). */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.usedAt = current_timestamp "
            + "WHERE t.userId = :userId AND t.usedAt IS NULL")
    int expireAllForUser(@Param("userId") UUID userId);
}