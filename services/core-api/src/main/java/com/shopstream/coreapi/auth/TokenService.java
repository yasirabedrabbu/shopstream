package com.shopstream.coreapi.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import com.shopstream.coreapi.config.JwtConfig;
import com.shopstream.coreapi.config.JwtProperties;
import com.shopstream.coreapi.user.User;

@Service
public class TokenService {

    private static final SecureRandom RANDOM = new SecureRandom();
    /** Refresh tokens live for 30 days. */
    private static final long REFRESH_TTL_SECONDS = 30L * 24 * 60 * 60;

    public record IssuedToken(String value, long expiresInSeconds) {
    }

    public record TokenPair(
            String accessToken,
            long accessExpiresInSeconds,
            String refreshToken) {
    }

    private final JwtEncoder encoder;
    private final JwtProperties props;

    public TokenService(JwtEncoder encoder, JwtProperties props) {
        this.encoder = encoder;
        this.props = props;
    }

    public IssuedToken issue(User user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(props.accessTokenTtl());

        JwsHeader header = JwsHeader.with(SignatureAlgorithm.RS256)
                .keyId(JwtConfig.KEY_ID)
                .build();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(props.issuer())
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiresAt(expiresAt)
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .build();

        String token = encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
        return new IssuedToken(token, props.accessTokenTtl().toSeconds());
    }

    /** Generate a cryptographically random opaque refresh token (URL-safe base64, 32 bytes). */
    public String generateRefreshToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public long refreshTtlSeconds() {
        return REFRESH_TTL_SECONDS;
    }

    /** SHA-256 hex of the raw token. This is what gets stored in the DB. */
    public static String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }
}