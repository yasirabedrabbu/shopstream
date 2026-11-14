package com.shopstream.coreapi.assistant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AssistantRequest(
        @NotBlank @Size(min = 2, max = 500) String message,
        Audience audience) {
}