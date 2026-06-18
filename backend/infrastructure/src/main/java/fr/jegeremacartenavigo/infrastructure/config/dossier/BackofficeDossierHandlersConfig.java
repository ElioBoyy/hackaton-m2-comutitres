package fr.jegeremacartenavigo.infrastructure.config.dossier;

import fr.jegeremacartenavigo.application.dossier.GetDossierCountsHandler;
import fr.jegeremacartenavigo.application.dossier.GetDossierDetailHandler;
import fr.jegeremacartenavigo.application.dossier.GetDossierHistoriqueHandler;
import fr.jegeremacartenavigo.application.dossier.GetDossiersHandler;
import fr.jegeremacartenavigo.application.dossier.ValiderPieceHandler;
import fr.jegeremacartenavigo.application.dossier.ResilierDossierHandler;
import fr.jegeremacartenavigo.application.dossier.SoumettreEnVerificationHandler;
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

    @Bean
    GetDossierHistoriqueHandler getDossierHistoriqueHandler(DossierRepository repository) {
        return new GetDossierHistoriqueHandler(repository);
    }

    @Bean
    ValiderPieceHandler validerPieceHandler(DossierRepository repository) {
        return new ValiderPieceHandler(repository);
    }

    @Bean
    ResilierDossierHandler resilierDossierHandler(DossierRepository repository) {
        return new ResilierDossierHandler(repository);
    }

    @Bean
    SoumettreEnVerificationHandler soumettreEnVerificationHandler(DossierRepository repository) {
        return new SoumettreEnVerificationHandler(repository);
    }
}
