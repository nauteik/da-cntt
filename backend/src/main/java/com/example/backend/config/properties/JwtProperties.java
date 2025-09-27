package com.example.backend.config.properties;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * JWT application properties binding
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /**
     * Secret key used to sign JWT tokens. Must be at least 32 characters for HS256.
     */
    @NotBlank
    private String secret = "mySecretKeyThatIsAtLeast32CharactersLong123456";

    /**
     * Expiration time in seconds.
     */
    @Positive
    private long expiration = 86400L;
}
