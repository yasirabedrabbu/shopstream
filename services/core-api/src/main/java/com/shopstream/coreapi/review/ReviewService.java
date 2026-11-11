package com.shopstream.coreapi.review;

import java.util.Objects;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import com.shopstream.coreapi.catalog.Product;
import com.shopstream.coreapi.catalog.ProductRepository;
import com.shopstream.coreapi.catalog.ProductStatus;
import com.shopstream.coreapi.common.ApiException;
import com.shopstream.coreapi.common.DisplayNames;
import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.notification.NotificationService;
import com.shopstream.coreapi.notification.NotificationType;
import com.shopstream.coreapi.order.FulfillmentStatus;
import com.shopstream.coreapi.order.OrderStatus;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;
import com.shopstream.coreapi.vendor.VendorStatus;

@Service
public class ReviewService {

    private record Created(Review review, UUID productId, UUID vendorOwnerId, String productName) {
    }

    private final ReviewRepository reviews;
    private final ProductRepository products;
    private final UserRepository users;
    private final NotificationService notifications;
    private final TransactionTemplate tx;

    public ReviewService(ReviewRepository reviews, ProductRepository products, UserRepository users,
            NotificationService notifications, TransactionTemplate tx) {
        this.reviews = reviews;
        this.products = products;
        this.users = users;
        this.notifications = notifications;
        this.tx = tx;
    }

    // ---------- public ----------

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> list(String slug, Pageable pageable) {
        Product product = publicProduct(slug);
        return PageResponse.of(reviews.findByProductId(product.getId(), pageable), ReviewResponse::from);
    }

    @Transactional(readOnly = true)
    public ReviewSummary summary(String slug) {
        Product product = publicProduct(slug);
        return ReviewSummary.from(reviews.countByRating(product.getId()));
    }

    // ---------- customer ----------

    public ReviewResponse create(UUID customerId, String slug, ReviewRequest request) {
        Created created;
        try {
            created = Objects.requireNonNull(tx.execute(s -> {
                Product product = publicProduct(slug);

                if (product.getVendor().getOwnerUserId().equals(customerId)) {
                    throw new ApiException(HttpStatus.FORBIDDEN, "You cannot review your own product");
                }
                if (!reviews.hasPurchased(customerId, product.getId(),
                        OrderStatus.PAID, FulfillmentStatus.DELIVERED)) {
                    throw new ApiException(HttpStatus.FORBIDDEN,
                            "You can review a product after it has been delivered to you");
                }
                if (reviews.findByProductIdAndCustomerId(product.getId(), customerId).isPresent()) {
                    throw new ApiException(HttpStatus.CONFLICT, "You already reviewed this product");
                }

                User user = users.findById(customerId)
                        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Account not found"));
                Review review = reviews.saveAndFlush(new Review(
                        product.getId(),
                        customerId,
                        request.rating(),
                        cleanComment(request.comment()),
                        reviewerName(user)));
                return new Created(review, product.getId(), product.getVendor().getOwnerUserId(),
                        product.getName());
            }));
        } catch (DataIntegrityViolationException ex) {
            // Two requests at the same moment: the unique (product, customer) rule caught the second one.
            throw new ApiException(HttpStatus.CONFLICT, "You already reviewed this product");
        }

        notifyVendor(created);
        return ReviewResponse.from(created.review());
    }

    @Transactional
    public ReviewResponse updateMine(UUID customerId, String slug, ReviewRequest request) {
        Review review = findMine(customerId, slug);
        review.update(request.rating(), cleanComment(request.comment()));
        return ReviewResponse.from(review);
    }

    @Transactional
    public void deleteMine(UUID customerId, String slug) {
        reviews.delete(findMine(customerId, slug));
    }

    // ---------- helpers ----------

    private Review findMine(UUID customerId, String slug) {
        Product product = publicProduct(slug);
        return reviews.findByProductIdAndCustomerId(product.getId(), customerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "You have not reviewed this product"));
    }

    private Product publicProduct(String slug) {
        return products.findBySlugAndStatusAndVendorStatus(slug, ProductStatus.ACTIVE, VendorStatus.APPROVED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    private void notifyVendor(Created c) {
        Review r = c.review();
        String snippet = r.getComment() == null ? "" : " \"" + shorten(r.getComment(), 200) + "\"";
        notifications.notifyUserOnce(
                "REVIEW_RECEIVED:" + r.getId(),
                c.vendorOwnerId(),
                NotificationType.REVIEW_RECEIVED,
                "New review on " + c.productName(),
                r.getReviewerName() + " gave " + r.getRating() + "/5." + snippet,
                "/vendor/products/" + c.productId());
    }

    private static String reviewerName(User user) {
        return shorten(DisplayNames.publicName(user.getFullName()), 80);
    }

    private static String cleanComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }
        return comment.trim();
    }

    private static String shorten(String value, int max) {
        return value.length() <= max ? value : value.substring(0, max);
    }
}