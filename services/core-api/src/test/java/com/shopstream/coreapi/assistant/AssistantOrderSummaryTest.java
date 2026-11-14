package com.shopstream.coreapi.assistant;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;

class AssistantOrderSummaryTest {

    @Test
    void orderCodeIsFirstEightCharactersInUppercase() {
        UUID id = UUID.fromString("3f2a9c1e-0000-4000-8000-000000000000");
        assertThat(AssistantOrderSummary.orderCode(id)).isEqualTo("3F2A9C1E");
    }
}