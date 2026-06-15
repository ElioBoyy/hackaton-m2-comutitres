package fr.jegeremacartenavigo.bootstrap.config.web;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Configuration CORS externalisee (prefixe {@code app.cors} dans application.yml).
 * Permet d'autoriser le front (TanStack Start) sans recompiler.
 *
 * @param allowedOrigins   origines autorisees (ex: http://localhost:3000)
 * @param allowedMethods   methodes HTTP autorisees
 * @param allowedHeaders   en-tetes autorises ("*" pour tous)
 * @param allowCredentials autoriser cookies / Authorization cross-origin
 */
@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(
        List<String> allowedOrigins,
        List<String> allowedMethods,
        List<String> allowedHeaders,
        boolean allowCredentials
) {
}
