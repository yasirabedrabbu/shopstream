package com.shopstream.coreapi.user;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<User> findByEmailIgnoreCase(String email);
}