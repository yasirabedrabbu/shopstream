package com.shopstream.coreapi.assistant;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.order.Order;
import com.shopstream.coreapi.order.OrderRepository;

@Service
public class AssistantOrderService {

    private static final int LIMIT = 5;

    private final OrderRepository orders;

    public AssistantOrderService(OrderRepository orders) {
        this.orders = orders;
    }

    /** Only the logged in customer's own orders. The customer id always comes from the JWT. */
    @Transactional(readOnly = true)
    public List<AssistantOrderSummary> recentOrders(UUID customerId) {
        Pageable page = PageRequest.of(0, LIMIT, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orders.findByCustomerId(customerId, page).getContent().stream()
                .map(AssistantOrderService::toSummary)
                .toList();
    }

    private static AssistantOrderSummary toSummary(Order order) {
        return new AssistantOrderSummary(
                AssistantOrderSummary.orderCode(order.getId()),
                order.getStatus(),
                order.getCurrency(),
                order.getTotalCents(),
                order.getCreatedAt());
    }
}