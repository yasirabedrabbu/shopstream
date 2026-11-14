package com.shopstream.coreapi.assistant;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.ApiException;

@Service
public class AssistantFaqAdminService {

    private final AssistantFaqRepository faqs;

    public AssistantFaqAdminService(AssistantFaqRepository faqs) {
        this.faqs = faqs;
    }

    @Transactional(readOnly = true)
    public List<AssistantFaqResponse> list() {
        return faqs.findAllByOrderByAudienceAscQuestionEnAsc().stream()
                .map(AssistantFaqResponse::from)
                .toList();
    }

    @Transactional
    public AssistantFaqResponse create(AssistantFaqRequest request) {
        AssistantFaq faq = new AssistantFaq(
                request.audience(),
                request.questionBn().trim(),
                request.questionEn().trim(),
                request.answerBn().trim(),
                request.answerEn().trim(),
                request.keywords(),
                blankToNull(request.link()));
        faq.setActive(request.active() == null || request.active());
        return AssistantFaqResponse.from(faqs.save(faq));
    }

    /** The audience cannot be changed after creation, so a FAQ never moves between customer and vendor. */
    @Transactional
    public AssistantFaqResponse update(UUID id, AssistantFaqRequest request) {
        AssistantFaq faq = faqs.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "FAQ not found"));

        if (faq.getAudience() != request.audience()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Audience cannot be changed. Create a new FAQ instead.");
        }

        faq.update(
                request.questionBn().trim(),
                request.questionEn().trim(),
                request.answerBn().trim(),
                request.answerEn().trim(),
                request.keywords(),
                blankToNull(request.link()));

        if (request.active() != null) {
            faq.setActive(request.active());
        }
        return AssistantFaqResponse.from(faq);
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}