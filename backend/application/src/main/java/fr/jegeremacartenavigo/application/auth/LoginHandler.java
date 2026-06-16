package fr.jegeremacartenavigo.application.auth;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.auth.exception.IdentifiantsInvalidesException;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.PasswordHasher;
import fr.jegeremacartenavigo.domain.auth.port.TokenIssuer;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;

public class LoginHandler implements CommandHandler<LoginCommand, TokenResponse> {

    private final UtilisateurAuthRepository repository;
    private final PasswordHasher passwordHasher;
    private final TokenIssuer tokenIssuer;

    public LoginHandler(UtilisateurAuthRepository repository,
                        PasswordHasher passwordHasher,
                        TokenIssuer tokenIssuer) {
        this.repository = repository;
        this.passwordHasher = passwordHasher;
        this.tokenIssuer = tokenIssuer;
    }

    @Override
    public TokenResponse handle(LoginCommand command) {
        String email = command.email().trim().toLowerCase();
        UtilisateurAuth utilisateur = repository.findByEmail(email)
                .orElseThrow(IdentifiantsInvalidesException::new);
        if (!passwordHasher.matches(command.password(), utilisateur.motDePasseHash())) {
            throw new IdentifiantsInvalidesException();
        }
        // Anti-enumeration : compte inactif/suspendu renvoie la meme erreur generique
        // que mot de passe errone, pour ne pas laisser un attaquant en deduire
        // "ce mot de passe est bon, le compte est juste desactive".
        if (!utilisateur.estActif()) {
            throw new IdentifiantsInvalidesException();
        }
        return TokenResponse.bearer(tokenIssuer.issue(utilisateur), tokenIssuer.ttlSeconds());
    }
}
