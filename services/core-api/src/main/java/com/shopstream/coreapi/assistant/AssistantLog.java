package com.shopstream.coreapi.assistant;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/** One row per question. The question is already redacted (no phone, email or ID numbers). */
@Entity
@Table(name = "assistant_logs")
public class AssistantLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Audience audience;

    @Column(nullable = false, length = 2)
    private String lang;

    @Column(nullable = false, length = 500)
    private String question;

    @Column(name = "matched_faq_id")
    private UUID matchedFaqId;

    @Column(nullable = false, length = 20)
    private String outcome;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AssistantLog() {
    }

    public AssistantLog(Audience audience, String lang, String question, UUID matchedFaqId, String outcome) {
        this.audience = audience;
        this.lang = lang;
        this.question = question;
        this.matchedFaqId = matchedFaqId;
        this.outcome = outcome;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public Audience getAudience() {
        return audience;
    }

    public String getLang() {
        return lang;
    }

    public String getQuestion() {
        return question;
    }

    public UUID getMatchedFaqId() {
        return matchedFaqId;
    }

    public String getOutcome() {
        return outcome;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}