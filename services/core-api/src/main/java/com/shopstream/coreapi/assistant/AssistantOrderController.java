package com.shopstream.coreapi.assistant;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Needs a logged in user. SecurityConfig already requires auth for everything outside the public list. */
@RestController
@RequestMapping("/api/v1/assistant")
public class AssistantOrderController {

    private final AssistantOrderService orderService;

    public AssistantOrderController(AssistantOrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/orders")
    public List<AssistantOrderSummary> myOrders(@AuthenticationPrincipal Jwt jwt) {
        return orderService.recentOrders(UUID.fromString(jwt.getSubject()));
    }
}