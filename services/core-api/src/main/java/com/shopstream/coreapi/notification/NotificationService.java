package com.shopstream.coreapi.notification;

import java.time.Instant;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.user.UserRepository;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final JdbcTemplate jdbc;
    private final NotificationRepository notifications;
    private final UserRepository users;
    private final EmailService email;
    private final String publicUrl;

    public NotificationService(JdbcTemplate jdbc, NotificationRepository notifications, UserRepository users,
            EmailService email, @Value("${app.public-url:http://localhost:3000}") String publicUrl) {
        this.jdbc = jdbc;
        this.notifications = notifications;
        this.users = users;
        this.email = email;
        this.publicUrl = publicUrl;
    }

    /** In-app + email. Never throws: a notification problem must not break the main flow. */
    public void notifyUser(UUID userId, NotificationType type, String title, String body, String link) {
        notifyUserOnce(null, userId, type, title, body, link);
    }

    /**
     * Same as notifyUser, but the dedupeKey makes it happen only once per event
     * (e.g. "ORDER_PAID:" + orderId). Returns true when a new notification was created.
     */
    public boolean notifyUserOnce(String dedupeKey, UUID userId, NotificationType type,
            String title, String body, String link) {
        String safeTitle = truncate(title, 160);
        String safeBody = truncate(body, 500);

        boolean created;
        try {
            int rows = jdbc.update(
                    "INSERT INTO notifications (user_id, type, title, body, link, dedupe_key) "
                            + "VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT (dedupe_key) DO NOTHING",
                    userId, type.name(), safeTitle, safeBody, link, dedupeKey);
            created = rows > 0;
        } catch (RuntimeException ex) {
            log.error("Could not store notification for user {}", userId, ex);
            return false;
        }

        if (created) {
            sendEmail(userId, safeTitle, safeBody, link);
        }
        return created;
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(UUID userId, Pageable pageable) {
        return PageResponse.of(
                notifications.findByUserIdOrderByCreatedAtDesc(userId, pageable),
                NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID userId) {
        return notifications.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void markRead(UUID userId, UUID notificationId) {
        Notification n = notifications.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
        n.markRead();
    }

    @Transactional
    public void markAllRead(UUID userId) {
        notifications.markAllRead(userId, Instant.now());
    }

    private void sendEmail(UUID userId, String title, String body, String link) {
        try {
            users.findById(userId).ifPresent(user -> {
                String text = body + (link != null ? "\n\n" + publicUrl + link : "");
                email.send(user.getEmail(), "[ShopStream] " + title, text);
            });
        } catch (RuntimeException ex) {
            log.warn("Could not queue email for user {}: {}", userId, ex.getMessage());
        }
    }

    private static String truncate(String value, int max) {
        if (value == null) {
            return "";
        }
        return value.length() <= max ? value : value.substring(0, max - 1) + "…";
    }
}