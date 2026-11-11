package com.shopstream.coreapi.fulfillment;

import com.shopstream.coreapi.order.FulfillmentStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateFulfillmentRequest(@NotNull FulfillmentStatus status) {
}