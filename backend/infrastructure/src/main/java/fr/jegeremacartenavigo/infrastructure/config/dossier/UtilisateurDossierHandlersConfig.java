package fr.jegeremacartenavigo.infrastructure.config.dossier;

import fr.jegeremacartenavigo.application.dossier.CreerDossierHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Handler {@code CreerDossierHandler} pour la creation d'un dossier depuis le
 * RecommendationWizard. Sans ce bean, le bus CQRS ne sait pas router la
 * commande et POST /dossiers retourne 500 (NoHandlerFoundException).
 *
 * <p>Le handler du dashboard utilisateur ({@code ObtenirDashboardUtilisateurHandler})
 * est declare a part dans {@link DashboardHandlersConfig}, les handlers backoffice
 * dans {@link BackofficeDossierHandlersConfig}.
 */
@Configuration
public class UtilisateurDossierHandlersConfig {

    @Bean
    CreerDossierHandler creerDossierHandler(DossierRepository repository) {
        return new CreerDossierHandler(repository);
    }
}
