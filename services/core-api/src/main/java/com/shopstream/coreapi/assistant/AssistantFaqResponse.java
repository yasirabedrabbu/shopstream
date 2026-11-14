package com.shopstream.coreapi.assistant;

import java.time.Instant;
import java.util.UUID;

public record AssistantFaqResponse(
        UUID id,
        Audience audience,
        String questionBn,
        String questionEn,
        String answerBn,
        String answerEn,
        String keywords,
        String link,
        boolean active,
        Instant updatedAt) {

    public static AssistantFaqResponse from(AssistantFaq faq) {
        return new AssistantFaqResponse(
                faq.getId(),
                faq.getAudience(),
                faq.getQuestionBn(),
                faq.getQuestionEn(),
                faq.getAnswerBn(),
                faq.getAnswerEn(),
                faq.getKeywords(),
                faq.getLink(),
                faq.isActive(),
                faq.getUpdatedAt());
    }
}