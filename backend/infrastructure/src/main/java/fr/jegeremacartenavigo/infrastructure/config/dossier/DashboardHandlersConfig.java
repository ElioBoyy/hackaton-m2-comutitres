package fr.jegeremacartenavigo.infrastructure.config.dossier;

import fr.jegeremacartenavigo.application.dossier.ObtenirDashboardUtilisateurHandler;
import fr.jegeremacartenavigo.domain.dossier.port.AlerteDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.DossierDashboardRepository;
import fr.jegeremacartenavigo.domain.dossier.port.UtilisateurIdentiteRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DashboardHandlersConfig {

    @Bean
    ObtenirDashboardUtilisateurHandler obtenirDashboardUtilisateurHandler(
            UtilisateurIdentiteRepository utilisateurRepository,
            DossierDashboardRepository dossierRepository,
            AlerteDashboardRepository alerteRepository) {
        return new ObtenirDashboardUtilisateurHandler(utilisateurRepository, dossierRepository, alerteRepository);
    }
}
