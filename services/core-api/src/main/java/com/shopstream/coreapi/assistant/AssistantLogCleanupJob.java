package com.shopstream.coreapi.assistant;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Deletes assistant questions older than 30 days, every day at 03:30 Dhaka time. */
@Component
public class AssistantLogCleanupJob {

    static final int RETENTION_DAYS = 30;

    private final AssistantLogRepository logs;

    public AssistantLogCleanupJob(AssistantLogRepository logs) {
        this.logs = logs;
    }

    @Scheduled(cron = "0 30 3 * * *", zone = "Asia/Dhaka")
    @Transactional
    public void purgeOldLogs() {
        logs.deleteByCreatedAtBefore(Instant.now().minus(RETENTION_DAYS, ChronoUnit.DAYS));
    }
}