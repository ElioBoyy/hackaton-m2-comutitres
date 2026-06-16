package fr.jegeremacartenavigo.domain.auth.port;

import fr.jegeremacartenavigo.domain.auth.model.AgentAuth;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;

/**
 * Port secondaire : emission d'un jeton d'acces pour un utilisateur ou un agent
 * authentifie. Implementation dans la couche infrastructure (JWT HS256 via
 * Nimbus). Le jeton porte un claim distinguant le type de principal, utilise
 * cote Spring Security pour restreindre certaines routes aux agents.
 */
public interface TokenIssuer {

    String issue(UtilisateurAuth utilisateur);

    String issue(AgentAuth agent);

    /** Duree de validite du jeton, en secondes. Expose au client pour info. */
    long ttlSeconds();
}
