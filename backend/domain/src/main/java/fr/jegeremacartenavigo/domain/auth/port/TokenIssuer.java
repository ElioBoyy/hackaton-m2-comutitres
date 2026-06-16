package fr.jegeremacartenavigo.domain.auth.port;

import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;

/**
 * Port secondaire : emission d'un jeton d'acces pour un utilisateur authentifie.
 * Implementation dans la couche infrastructure (JWT HS256 via Nimbus).
 */
public interface TokenIssuer {

    String issue(UtilisateurAuth utilisateur);

    /** Duree de validite du jeton, en secondes. Expose au client pour info. */
    long ttlSeconds();
}
