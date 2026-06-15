package fr.jegeremacartenavigo.bootstrap.config.web;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Politique CORS globale, appliquee a toutes les routes ({@code /**}), pilotee
 * par {@link CorsProperties}.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final CorsProperties properties;

    public CorsConfig(CorsProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(properties.allowedOrigins().toArray(String[]::new))
                .allowedMethods(properties.allowedMethods().toArray(String[]::new))
                .allowedHeaders(properties.allowedHeaders().toArray(String[]::new))
                .allowCredentials(properties.allowCredentials());
    }
}
