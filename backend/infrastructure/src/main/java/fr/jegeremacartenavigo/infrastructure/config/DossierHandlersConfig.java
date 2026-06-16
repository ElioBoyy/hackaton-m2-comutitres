package fr.jegeremacartenavigo.infrastructure.config;

import fr.jegeremacartenavigo.application.dossier.CreerDossierHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Expose les use cases Dossier (couche application, sans Spring) en beans.
 * Pendant de {@code AuthHandlersConfig} pour le contexte Dossier.
 */
@Configuration
public class DossierHandlersConfig {

    @Bean
    CreerDossierHandler creerDossierHandler(DossierRepository repository) {
        return new CreerDossierHandler(repository);
    }
}
