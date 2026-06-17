package fr.jegeremacartenavigo.infrastructure.config.dossier;

import fr.jegeremacartenavigo.application.dossier.CreerDossierHandler;
import fr.jegeremacartenavigo.application.dossier.GetDossierDetailHandler;
import fr.jegeremacartenavigo.application.dossier.GetDossiersHandler;
import fr.jegeremacartenavigo.application.dossier.ObtenirDashboardUtilisateurHandler;
import fr.jegeremacartenavigo.domain.dossier.port.AlerteDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.DossierDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import fr.jegeremacartenavigo.domain.dossier.port.UtilisateurIdentiteRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Expose les use cases dossier (couche application, sans Spring) en beans.
 */
@Configuration
public class DossierHandlersConfig {

    @Bean
    GetDossiersHandler getDossiersHandler(DossierRepository repository) {
        return new GetDossiersHandler(repository);
    }

    @Bean
    GetDossierDetailHandler getDossierDetailHandler(DossierRepository repository) {
        return new GetDossierDetailHandler(repository);
    }

    @Bean
    ObtenirDashboardUtilisateurHandler obtenirDashboardUtilisateurHandler(
            UtilisateurIdentiteRepository utilisateurRepository,
            DossierDashboardRepository dossierRepository,
            AlerteDashboardRepository alerteRepository) {
        return new ObtenirDashboardUtilisateurHandler(utilisateurRepository, dossierRepository, alerteRepository);
    }

    @Bean
    CreerDossierHandler creerDossierHandler(DossierRepository repository) {
        return new CreerDossierHandler(repository);
    }
}
