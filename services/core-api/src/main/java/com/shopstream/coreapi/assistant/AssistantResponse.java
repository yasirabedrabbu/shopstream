package com.shopstream.coreapi.assistant;

import java.util.List;

/**
 * type: ANSWER (FAQ matched) or HANDOFF (no match, show the WhatsApp button).
 * suggestions: up to 3 other questions the user can tap, in the same language as the answer.
 */
public record AssistantResponse(
        String type,
        String answer,
        String link,
        List<String> suggestions,
        String handoffUrl) {
}