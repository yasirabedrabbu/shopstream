package com.shopstream.coreapi.assistant;

import java.time.Instant;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssistantLogRepository extends JpaRepository<AssistantLog, UUID> {

    long deleteByCreatedAtBefore(Instant cutoff);
}