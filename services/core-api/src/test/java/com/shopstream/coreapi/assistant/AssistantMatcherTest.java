package com.shopstream.coreapi.assistant;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;

class AssistantMatcherTest {

    private static AssistantFaq faq(String keywords) {
        return new AssistantFaq(Audience.CUSTOMER,
                "ডেলিভারি কতদিন লাগে?", "How long does delivery take?",
                "২-৫ কার্যদিবস।", "Usually 2 to 5 working days.",
                keywords, null);
    }

    @Test
    void detectsBanglaAndEnglish() {
        assertThat(AssistantMatcher.detectLanguage("ডেলিভারি কবে আসবে")).isEqualTo("bn");
        assertThat(AssistantMatcher.detectLanguage("when will it arrive")).isEqualTo("en");
    }

    @Test
    void normalizeKeepsBanglaVowelSigns() {
        assertThat(AssistantMatcher.normalize("ডেলিভারি কতদিন?")).contains("ডেলিভারি").contains("কতদিন");
    }

    @Test
    void matchesKeywordPhraseInBanglaMessage() {
        assertThat(AssistantMatcher.best("আমার ডেলিভারি কবে আসবে", List.of(faq("ডেলিভারি, delivery")))).isPresent();
    }

    @Test
    void matchesEnglishQuestionWords() {
        assertThat(AssistantMatcher.best("how long does delivery take", List.of(faq("delivery")))).isPresent();
    }

    @Test
    void ignoresCaseAndPunctuation() {
        assertThat(AssistantMatcher.best("DELIVERY!!!", List.of(faq("delivery")))).isPresent();
    }

    @Test
    void returnsEmptyForUnrelatedMessage() {
        assertThat(AssistantMatcher.best("what is the weather today", List.of(faq("delivery")))).isEmpty();
    }
}