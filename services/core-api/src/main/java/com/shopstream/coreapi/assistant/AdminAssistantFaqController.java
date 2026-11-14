package com.shopstream.coreapi.assistant;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

/** /api/v1/admin/** is already restricted to ADMIN in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/admin/assistant/faqs")
public class AdminAssistantFaqController {

    private final AssistantFaqAdminService service;

    public AdminAssistantFaqController(AssistantFaqAdminService service) {
        this.service = service;
    }

    @GetMapping
    public List<AssistantFaqResponse> list() {
        return service.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssistantFaqResponse create(@Valid @RequestBody AssistantFaqRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public AssistantFaqResponse update(@PathVariable UUID id, @Valid @RequestBody AssistantFaqRequest request) {
        return service.update(id, request);
    }
}