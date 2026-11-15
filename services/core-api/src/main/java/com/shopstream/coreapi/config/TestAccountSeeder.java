package com.shopstream.coreapi.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.shopstream.coreapi.user.Role;
import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;
import com.shopstream.coreapi.vendor.Vendor;
import com.shopstream.coreapi.vendor.VendorRepository;
import com.shopstream.coreapi.vendor.VendorStatus;

/**
 * Fixed-credential accounts for manual testing of the customer and seller dashboards.
 *
 * Runs ONLY when app.seed.test-accounts=true (env SEED_TEST_ACCOUNTS=true).
 * Never enable this in production: the passwords are public in the repository.
 * The platform admin is NOT created here. It still comes from ADMIN_EMAIL / ADMIN_PASSWORD.
 */
@Component
@Order(1)
public class TestAccountSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TestAccountSeeder.class);

    static final String CUSTOMER_EMAIL = "customer@shopstream.local";
    static final String CUSTOMER_PASSWORD = "Customer@12345";
    static final String SELLER_EMAIL = "seller@shopstream.local";
    static final String SELLER_PASSWORD = "Seller@12345";

    private final UserRepository users;
    private final VendorRepository vendors;
    private final PasswordEncoder passwordEncoder;
    private final boolean enabled;

    public TestAccountSeeder(UserRepository users,
            VendorRepository vendors,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.test-accounts:false}") boolean enabled) {
        this.users = users;
        this.vendors = vendors;
        this.passwordEncoder = passwordEncoder;
        this.enabled = enabled;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }
        log.warn("SEED_TEST_ACCOUNTS=true: creating fixed-password test accounts. Never use this in production.");

        if (!users.existsByEmailIgnoreCase(CUSTOMER_EMAIL)) {
            users.save(new User(CUSTOMER_EMAIL, passwordEncoder.encode(CUSTOMER_PASSWORD), "Test Customer", Role.CUSTOMER));
            log.info("Test customer created: {}", CUSTOMER_EMAIL);
        }

        if (!users.existsByEmailIgnoreCase(SELLER_EMAIL)) {
            User owner = users.save(new User(SELLER_EMAIL, passwordEncoder.encode(SELLER_PASSWORD), "Test Seller", Role.VENDOR));
            Vendor store = new Vendor(owner.getId(), "Test Seller Store", "test-seller-store",
                    "Test store for checking the seller studio.");
            store.setStatus(VendorStatus.APPROVED);
            vendors.save(store);
            log.info("Test seller + approved store created: {}", SELLER_EMAIL);
        }
    }
}
