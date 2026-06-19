package fr.jegeremacartenavigo.infrastructure.config.security;

import fr.jegeremacartenavigo.application.auth.LoginHandler;
import fr.jegeremacartenavigo.application.auth.RegisterHandler;
import fr.jegeremacartenavigo.application.identite.EnvoyerCodeTelephoneHandler;
import fr.jegeremacartenavigo.application.identite.VerifierCodeTelephoneHandler;
import fr.jegeremacartenavigo.domain.auth.port.CompteAuthRepository;
import fr.jegeremacartenavigo.domain.auth.port.PasswordHasher;
import fr.jegeremacartenavigo.domain.auth.port.TokenIssuer;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
import fr.jegeremacartenavigo.domain.identite.port.ServiceOtp;
import fr.jegeremacartenavigo.domain.identite.port.VerificationTelephoneRepository;
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
                                    TokenIssuer tokenIssuer) {
        return new RegisterHandler(repository, passwordHasher, tokenIssuer);
    }

    @Bean
    LoginHandler loginHandler(CompteAuthRepository repository,
                              PasswordHasher passwordHasher,
                              TokenIssuer tokenIssuer) {
        return new LoginHandler(repository, passwordHasher, tokenIssuer);
    }

    @Bean
    EnvoyerCodeTelephoneHandler envoyerCodeTelephoneHandler(VerificationTelephoneRepository repository,
                                                            ServiceOtp serviceOtp) {
        return new EnvoyerCodeTelephoneHandler(repository, serviceOtp);
    }

    @Bean
    VerifierCodeTelephoneHandler verifierCodeTelephoneHandler(VerificationTelephoneRepository repository,
                                                              ServiceOtp serviceOtp) {
        return new VerifierCodeTelephoneHandler(repository, serviceOtp);
    }
}
