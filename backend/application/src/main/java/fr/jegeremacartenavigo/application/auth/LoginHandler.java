package fr.jegeremacartenavigo.application.auth;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.auth.exception.IdentifiantsInvalidesException;
import fr.jegeremacartenavigo.domain.auth.model.CompteAuth;
import fr.jegeremacartenavigo.domain.auth.port.CompteAuthRepository;
import fr.jegeremacartenavigo.domain.auth.port.PasswordHasher;
import fr.jegeremacartenavigo.domain.auth.port.TokenIssuer;

/**
 * Login generique : un compte client ou agent, identifie par email, est
 * cherche via {@link CompteAuthRepository} (qui compose les repositories
 * specifiques aux deux types de compte). Le type de compte trouve determine
 * le claim {@code type} du jeton emis (cf. {@link TokenIssuer#issue(CompteAuth)}).
 */
public class LoginHandler implements CommandHandler<LoginCommand, TokenResponse> {

    private final CompteAuthRepository repository;
    private final PasswordHasher passwordHasher;
    private final TokenIssuer tokenIssuer;

    public LoginHandler(CompteAuthRepository repository,
                        PasswordHasher passwordHasher,
                        TokenIssuer tokenIssuer) {
        this.repository = repository;
        this.passwordHasher = passwordHasher;
        this.tokenIssuer = tokenIssuer;
    }

    @Override
    public TokenResponse handle(LoginCommand command) {
        String email = command.email().trim().toLowerCase();
        CompteAuth compte = repository.findByEmail(email)
                .orElseThrow(IdentifiantsInvalidesException::new);
        if (!passwordHasher.matches(command.password(), compte.motDePasseHash())) {
            throw new IdentifiantsInvalidesException();
        }
        // Anti-enumeration : compte inactif/suspendu renvoie la meme erreur generique
        // que mot de passe errone, pour ne pas laisser un attaquant en deduire
        // "ce mot de passe est bon, le compte est juste desactive".
        if (!compte.estActif()) {
            throw new IdentifiantsInvalidesException();
        }
        return TokenResponse.bearer(tokenIssuer.issue(compte), tokenIssuer.ttlSeconds());
    }
}
