package fr.jegeremacartenavigo.infrastructure.config;


import fr.jegeremacartenavigo.application.dossier.CreerDossierHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
  
import fr.jegeremacartenavigo.application.dossier.ObtenirDashboardUtilisateurHandler;
import fr.jegeremacartenavigo.domain.dossier.port.AlerteDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.DossierDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.UtilisateurIdentiteRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Expose les use cases dossier (couche application, sans Spring) en beans.
 * Pendant de {@code AuthHandlersConfig} pour le contexte dossier.
 */
@Configuration
public class DossierHandlersConfig {

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
