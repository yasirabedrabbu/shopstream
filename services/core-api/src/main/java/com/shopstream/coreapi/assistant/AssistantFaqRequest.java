package com.shopstream.coreapi.assistant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AssistantFaqRequest(
        @NotNull Audience audience,
        @NotBlank @Size(max = 500) String questionBn,
        @NotBlank @Size(max = 500) String questionEn,
        @NotBlank @Size(max = 2000) String answerBn,
        @NotBlank @Size(max = 2000) String answerEn,
        @Size(max = 1000) String keywords,
        @Size(max = 300)
        @Pattern(regexp = "^(https?://|/).*", message = "link must start with http://, https:// or /")
        String link,
        Boolean active) {
}