package fr.jegeremacartenavigo.application.auth;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.auth.exception.EmailDejaUtiliseException;
import fr.jegeremacartenavigo.domain.auth.model.StatutCompte;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.PasswordHasher;
import fr.jegeremacartenavigo.domain.auth.port.TokenIssuer;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;

public class RegisterHandler implements CommandHandler<RegisterCommand, TokenResponse> {

    private final UtilisateurAuthRepository repository;
    private final PasswordHasher passwordHasher;
    private final TokenIssuer tokenIssuer;

    public RegisterHandler(UtilisateurAuthRepository repository,
                           PasswordHasher passwordHasher,
                           TokenIssuer tokenIssuer) {
        this.repository = repository;
        this.passwordHasher = passwordHasher;
        this.tokenIssuer = tokenIssuer;
    }

    @Override
    public TokenResponse handle(RegisterCommand command) {
        String email = command.email().trim().toLowerCase();
        if (repository.existsByEmail(email)) {
            throw new EmailDejaUtiliseException();
        }
        UtilisateurAuth nouveau = new UtilisateurAuth(
                null,
                email,
                passwordHasher.hash(command.password()),
                command.nom(),
                command.prenom(),
                command.dateNaissance(),
                StatutCompte.actif
        );
        UtilisateurAuth persiste = repository.save(nouveau);
        return TokenResponse.bearer(tokenIssuer.issue(persiste), tokenIssuer.ttlSeconds());
    }
}
