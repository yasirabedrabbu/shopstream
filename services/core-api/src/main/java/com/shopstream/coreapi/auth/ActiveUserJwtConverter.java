// services/core-api/src/main/java/com/shopstream/coreapi/auth/ActiveUserJwtConverter.java
package com.shopstream.coreapi.auth;

import java.util.List;
import java.util.UUID;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import com.shopstream.coreapi.user.User;
import com.shopstream.coreapi.user.UserRepository;
import com.shopstream.coreapi.user.UserStatus;

/**
 * Turns a valid JWT into an authentication, but only if the user still exists and is ACTIVE.
 * Role comes from the database, not from the token, so a role change takes effect on the next request.
 *
 * Cost: one primary-key lookup per authenticated request. If this becomes a bottleneck,
 * add a short-lived cache (for example 30 seconds) keyed by user id.
 */
@Component
public class ActiveUserJwtConverter implements Converter<Jwt, JwtAuthenticationToken> {

    private final UserRepository users;

    public ActiveUserJwtConverter(UserRepository users) {
        this.users = users;
    }

    @Override
    public JwtAuthenticationToken convert(Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());

        User user = users.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Unknown user"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new DisabledException("Account is suspended");
        }

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    }
}