package com.shopstream.coreapi.review;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.common.PageResponse;
import com.shopstream.coreapi.vendor.VendorService;

@Service
public class VendorReviewService {

    private final ReviewRepository reviews;
    private final VendorService vendors;

    public VendorReviewService(ReviewRepository reviews, VendorService vendors) {
        this.reviews = reviews;
        this.vendors = vendors;
    }

    @Transactional(readOnly = true)
    public PageResponse<VendorReviewResponse> list(UUID ownerId, Pageable pageable) {
        UUID vendorId = vendors.getMine(ownerId).getId();
        return PageResponse.of(reviews.findForVendor(vendorId, pageable), VendorReviewResponse::from);
    }
}