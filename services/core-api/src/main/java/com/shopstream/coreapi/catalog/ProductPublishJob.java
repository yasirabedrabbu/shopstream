package com.shopstream.coreapi.catalog;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

/** Every minute, moves SCHEDULED products to ACTIVE once their publish time has passed. */
@Component
public class ProductPublishJob {

    private static final Logger log = LoggerFactory.getLogger(ProductPublishJob.class);

    private final ProductRepository products;
    private final TransactionTemplate tx;

    public ProductPublishJob(ProductRepository products, TransactionTemplate tx) {
        this.products = products;
        this.tx = tx;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void publishDue() {
        Integer published = tx.execute(status -> products.activateDueScheduled());
        if (published != null && published > 0) {
            log.info("Published {} scheduled product(s)", published);
        }
    }
}
