package com.shopstream.coreapi.fulfillment;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.notification.NotificationService;
import com.shopstream.coreapi.notification.NotificationType;
import com.shopstream.coreapi.order.FulfillmentStatus;
import com.shopstream.coreapi.order.OrderItem;
import com.shopstream.coreapi.order.OrderStatus;
import com.shopstream.coreapi.vendor.VendorService;

@Service
public class FulfillmentService {

    /** The only allowed moves. A vendor cannot skip a step or go backwards. */
    private static final Map<FulfillmentStatus, FulfillmentStatus> NEXT = Map.of(
            FulfillmentStatus.NEW, FulfillmentStatus.PACKED,
            FulfillmentStatus.PACKED, FulfillmentStatus.SHIPPED,
            FulfillmentStatus.SHIPPED, FulfillmentStatus.DELIVERED);

    private record Result(VendorOrderItemResponse response, UUID customerId, UUID orderId, String productName) {
    }

    private final OrderItemRepository items;
    private final VendorService vendors;
    private final NotificationService notifications;
    private final TransactionTemplate tx;

    public FulfillmentService(OrderItemRepository items, VendorService vendors,
            NotificationService notifications, TransactionTemplate tx) {
        this.items = items;
        this.vendors = vendors;
        this.notifications = notifications;
        this.tx = tx;
    }

    /** Items from PAID orders only. A vendor never sees unpaid or cancelled orders. */
    @Transactional(readOnly = true)
    public PageResponse<VendorOrderItemResponse> list(UUID ownerId, FulfillmentStatus status, Pageable pageable) {
        UUID vendorId = vendors.getMine(ownerId).getId();
        Page<OrderItem> page = status == null
                ? items.findForVendor(vendorId, OrderStatus.PAID, pageable)
                : items.findForVendorByFulfillment(vendorId, OrderStatus.PAID, status, pageable);
        return PageResponse.of(page, VendorOrderItemResponse::from);
    }

    public VendorOrderItemResponse advance(UUID ownerId, UUID itemId, FulfillmentStatus target) {
        UUID vendorId = vendors.getMine(ownerId).getId();

        Result result = Objects.requireNonNull(tx.execute(s -> {
            OrderItem item = items.findOwned(itemId, vendorId)
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Order item not found"));

            if (item.getOrder().getStatus() != OrderStatus.PAID) {
                throw new ApiException(HttpStatus.CONFLICT, "This order is not paid");
            }
            FulfillmentStatus expected = NEXT.get(item.getFulfillmentStatus());
            if (expected == null || expected != target) {
                throw new ApiException(HttpStatus.CONFLICT,
                        "Cannot move from " + item.getFulfillmentStatus() + " to " + target);
            }

            item.setFulfillmentStatus(target);
            return new Result(VendorOrderItemResponse.from(item),
                    item.getOrder().getCustomerId(), item.getOrder().getId(), item.getProductName());
        }));

        notifyCustomer(result, itemId, target);
        return result.response();
    }

    private void notifyCustomer(Result r, UUID itemId, FulfillmentStatus target) {
        if (target == FulfillmentStatus.SHIPPED) {
            notifications.notifyUserOnce("ITEM_SHIPPED:" + itemId, r.customerId(),
                    NotificationType.ORDER_SHIPPED,
                    "Your item has shipped",
                    r.productName() + " is on its way to you.",
                    "/orders/" + r.orderId());
        } else if (target == FulfillmentStatus.DELIVERED) {
            notifications.notifyUserOnce("ITEM_DELIVERED:" + itemId, r.customerId(),
                    NotificationType.ORDER_DELIVERED,
                    "Delivered: " + r.productName(),
                    "Hope you love it. You can now leave a review.",
                    "/orders/" + r.orderId());
        }
    }
}