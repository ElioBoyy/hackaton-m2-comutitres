package fr.jegeremacartenavigo.application.auth;

import fr.jegeremacartenavigo.application.cqrs.Response;

/**
 * Reponse retournee par {@code RegisterCommand} et {@code LoginCommand}.
 * Format compatible avec la convention OAuth2 (Bearer + expires_in).
 */
public record TokenResponse(String accessToken, long expiresIn, String tokenType) implements Response {

    public static TokenResponse bearer(String accessToken, long expiresIn) {
        return new TokenResponse(accessToken, expiresIn, "Bearer");
    }
}
