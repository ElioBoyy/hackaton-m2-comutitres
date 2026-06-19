package fr.jegeremacartenavigo.infrastructure.config.security;

import fr.jegeremacartenavigo.application.auth.LoginHandler;
import fr.jegeremacartenavigo.application.auth.RegisterHandler;
import fr.jegeremacartenavigo.domain.auth.port.CompteAuthRepository;
import fr.jegeremacartenavigo.domain.auth.port.PasswordHasher;
import fr.jegeremacartenavigo.domain.auth.port.TokenIssuer;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
import fr.jegeremacartenavigo.domain.dossier.port.NotificateurDossier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Expose les use cases auth (couche application, sans Spring) en beans.
 * Pendant Spring de la config {@code CqrsConfig} pour les use cases auth.
 */
@Configuration
public class AuthHandlersConfig {

    @Bean
    RegisterHandler registerHandler(UtilisateurAuthRepository repository,
                                    PasswordHasher passwordHasher,
                                    TokenIssuer tokenIssuer,
                                    NotificateurDossier notificateur) {
        return new RegisterHandler(repository, passwordHasher, tokenIssuer, notificateur);
    }

    @Bean
    LoginHandler loginHandler(CompteAuthRepository repository,
                              PasswordHasher passwordHasher,
                              TokenIssuer tokenIssuer) {
        return new LoginHandler(repository, passwordHasher, tokenIssuer);
    }
}
