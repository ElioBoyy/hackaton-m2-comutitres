package fr.jegeremacartenavigo.infrastructure.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Parametres JWT (HMAC HS256). Le secret doit faire au moins 256 bits (32 octets
 * en UTF-8) pour HS256.
 */
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(String secret, String issuer, long expiresMinutes) {
}
