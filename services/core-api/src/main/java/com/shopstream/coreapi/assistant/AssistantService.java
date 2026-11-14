package com.shopstream.coreapi.assistant;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AssistantService {

    static final String ANSWER = "ANSWER";
    static final String HANDOFF = "HANDOFF";
    private static final int MAX_SUGGESTIONS = 3;

    private static final String HANDOFF_BN =
            "এই প্রশ্নের উত্তর আমার কাছে এখনো নেই। নিচের বাটনে WhatsApp এ আমাদের টিমের সাথে কথা বলুন।";
    private static final String HANDOFF_EN =
            "I do not have an answer to that yet. Please chat with our team on WhatsApp using the button below.";

    private final AssistantFaqRepository faqs;
    private final AssistantLogRepository logs;
    private final AssistantRateLimiter limiter;
    private final String whatsappUrl;

    public AssistantService(AssistantFaqRepository faqs,
            AssistantLogRepository logs,
            AssistantRateLimiter limiter,
            @Value("${app.assistant.whatsapp-url:}") String whatsappUrl) {
        this.faqs = faqs;
        this.logs = logs;
        this.limiter = limiter;
        this.whatsappUrl = whatsappUrl;
    }

    @Transactional
    public AssistantResponse answer(String clientIp, AssistantRequest request) {
        limiter.check(clientIp);

        String message = request.message().trim();
        Audience audience = request.audience() == null ? Audience.CUSTOMER : request.audience();
        String lang = AssistantMatcher.detectLanguage(message);

        List<AssistantFaq> candidates = faqs.findAllByAudienceAndActiveTrueOrderByQuestionEnAsc(audience);
        Optional<AssistantMatcher.Match> match = AssistantMatcher.best(message, candidates);

        AssistantResponse response;
        UUID matchedId = null;

        if (match.isPresent()) {
            AssistantFaq faq = match.get().faq();
            matchedId = faq.getId();
            response = new AssistantResponse(
                    ANSWER,
                    pick(faq.getAnswerBn(), faq.getAnswerEn(), lang),
                    faq.getLink(),
                    suggestions(candidates, faq, lang),
                    null);
        } else {
            response = new AssistantResponse(
                    HANDOFF,
                    pick(HANDOFF_BN, HANDOFF_EN, lang),
                    null,
                    suggestions(candidates, null, lang),
                    hasText(whatsappUrl) ? whatsappUrl : null);
        }

        logs.save(new AssistantLog(audience, lang, PiiRedactor.redact(message), matchedId, response.type()));
        return response;
    }

    private static List<String> suggestions(List<AssistantFaq> candidates, AssistantFaq exclude, String lang) {
        return candidates.stream()
                .filter(f -> f != exclude)
                .limit(MAX_SUGGESTIONS)
                .map(f -> pick(f.getQuestionBn(), f.getQuestionEn(), lang))
                .toList();
    }

    private static String pick(String bn, String en, String lang) {
        return "bn".equals(lang) ? bn : en;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}