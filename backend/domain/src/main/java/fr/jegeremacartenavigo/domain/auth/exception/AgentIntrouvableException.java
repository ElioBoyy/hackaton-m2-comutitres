package fr.jegeremacartenavigo.domain.auth.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand un agent ne peut etre retrouve par son identifiant (typiquement :
 * JWT valide mais ligne supprimee en BDD). Mappee en 404.
 */
public class AgentIntrouvableException extends DomainException {

    public AgentIntrouvableException() {
        super("Agent introuvable.");
    }
}
