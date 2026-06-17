package fr.jegeremacartenavigo.domain.auth.port;

import fr.jegeremacartenavigo.domain.auth.model.CompteAuth;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;

/**
 * Port secondaire : emission d'un jeton d'acces pour un compte authentifie.
 * Implementation dans la couche infrastructure (JWT HS256 via Nimbus). Le
 * jeton porte un claim distinguant le type de principal (client/agent), utilise
 * cote Spring Security pour restreindre certaines routes aux agents.
 *
 * <p>{@code issue(UtilisateurAuth)} reste dedie au register (qui cree un
 * compte client specifiquement) ; {@code issue(CompteAuth)} sert au login
 * generique (unifie client/agent).
 */
public interface TokenIssuer {

    String issue(UtilisateurAuth utilisateur);

    String issue(CompteAuth compte);

    /** Duree de validite du jeton, en secondes. Expose au client pour info. */
    long ttlSeconds();
}
