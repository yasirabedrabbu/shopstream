package com.shopstream.coreapi.assistant;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "assistant_faqs")
public class AssistantFaq {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Audience audience;

    @Column(name = "question_bn", nullable = false, length = 500)
    private String questionBn;

    @Column(name = "question_en", nullable = false, length = 500)
    private String questionEn;

    @Column(name = "answer_bn", nullable = false, length = 2000)
    private String answerBn;

    @Column(name = "answer_en", nullable = false, length = 2000)
    private String answerEn;

    @Column(nullable = false, length = 1000)
    private String keywords;

    @Column(length = 300)
    private String link;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected AssistantFaq() {
    }

    public AssistantFaq(Audience audience, String questionBn, String questionEn, String answerBn,
            String answerEn, String keywords, String link) {
        this.audience = audience;
        this.questionBn = questionBn;
        this.questionEn = questionEn;
        this.answerBn = answerBn;
        this.answerEn = answerEn;
        this.keywords = keywords == null ? "" : keywords;
        this.link = link;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public void update(String questionBn, String questionEn, String answerBn, String answerEn,
            String keywords, String link) {
        this.questionBn = questionBn;
        this.questionEn = questionEn;
        this.answerBn = answerBn;
        this.answerEn = answerEn;
        this.keywords = keywords == null ? "" : keywords;
        this.link = link;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    /** Comma separated keywords, lowercased and trimmed. Empty entries are dropped. */
    public List<String> keywordList() {
        return Arrays.stream(keywords.split(","))
                .map(s -> s.trim().toLowerCase(Locale.ROOT))
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public UUID getId() {
        return id;
    }

    public Audience getAudience() {
        return audience;
    }

    public String getQuestionBn() {
        return questionBn;
    }

    public String getQuestionEn() {
        return questionEn;
    }

    public String getAnswerBn() {
        return answerBn;
    }

    public String getAnswerEn() {
        return answerEn;
    }

    public String getKeywords() {
        return keywords;
    }

    public String getLink() {
        return link;
    }

    public boolean isActive() {
        return active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}