package fr.jegeremacartenavigo.infrastructure.config.dossier;

import fr.jegeremacartenavigo.application.dossier.GetDossierCountsHandler;
import fr.jegeremacartenavigo.application.dossier.GetDossierDetailHandler;
import fr.jegeremacartenavigo.application.dossier.GetDossiersHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BackofficeDossierHandlersConfig {

    @Bean
    GetDossiersHandler getDossiersHandler(DossierRepository repository) {
        return new GetDossiersHandler(repository);
    }

    @Bean
    GetDossierDetailHandler getDossierDetailHandler(DossierRepository repository) {
        return new GetDossierDetailHandler(repository);
    }

    @Bean
    GetDossierCountsHandler getDossierCountsHandler(DossierRepository repository) {
        return new GetDossierCountsHandler(repository);
    }
}
