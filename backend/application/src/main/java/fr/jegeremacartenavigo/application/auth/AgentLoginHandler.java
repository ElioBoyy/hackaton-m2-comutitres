package fr.jegeremacartenavigo.application.auth;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.auth.exception.IdentifiantsInvalidesException;
import fr.jegeremacartenavigo.domain.auth.model.AgentAuth;
import fr.jegeremacartenavigo.domain.auth.port.AgentAuthRepository;
import fr.jegeremacartenavigo.domain.auth.port.PasswordHasher;
import fr.jegeremacartenavigo.domain.auth.port.TokenIssuer;

public class AgentLoginHandler implements CommandHandler<AgentLoginCommand, TokenResponse> {

    private final AgentAuthRepository repository;
    private final PasswordHasher passwordHasher;
    private final TokenIssuer tokenIssuer;

    public AgentLoginHandler(AgentAuthRepository repository,
                              PasswordHasher passwordHasher,
                              TokenIssuer tokenIssuer) {
        this.repository = repository;
        this.passwordHasher = passwordHasher;
        this.tokenIssuer = tokenIssuer;
    }

    @Override
    public TokenResponse handle(AgentLoginCommand command) {
        String email = command.email().trim().toLowerCase();
        AgentAuth agent = repository.findByEmail(email)
                .orElseThrow(IdentifiantsInvalidesException::new);
        if (agent.motDePasseHash() == null
                || !passwordHasher.matches(command.password(), agent.motDePasseHash())) {
            throw new IdentifiantsInvalidesException();
        }
        if (!agent.estActif()) {
            throw new IdentifiantsInvalidesException();
        }
        return TokenResponse.bearer(tokenIssuer.issue(agent), tokenIssuer.ttlSeconds());
    }
}
