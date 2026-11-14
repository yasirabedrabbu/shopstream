package com.shopstream.coreapi.assistant;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class PiiRedactorTest {

    @Test
    void redactsEmail() {
        String out = PiiRedactor.redact("mail me at rahim@example.com please");
        assertThat(out).contains("[email]").doesNotContain("@");
    }

    @Test
    void redactsBangladeshiPhoneNumbers() {
        assertThat(PiiRedactor.redact("call 01712345678")).contains("[phone]").doesNotContain("01712345678");
        assertThat(PiiRedactor.redact("+880 1712-345678")).contains("[phone]");
    }

    @Test
    void redactsNationalId() {
        assertThat(PiiRedactor.redact("my NID 1234567890")).contains("[id]").doesNotContain("1234567890");
    }

    @Test
    void leavesNormalTextAlone() {
        assertThat(PiiRedactor.redact("What is your return policy?")).isEqualTo("What is your return policy?");
    }
}