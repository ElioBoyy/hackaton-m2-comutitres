package fr.jegeremacartenavigo.domain.auth.port;

import fr.jegeremacartenavigo.domain.auth.model.CompteAuth;

import java.util.Optional;

/**
 * Port secondaire : recherche d'un compte (client ou agent) par email, pour le
 * login generique unifie. Implementation dans la couche infrastructure,
 * composee de {@link UtilisateurAuthRepository} et {@link AgentAuthRepository}.
 */
public interface CompteAuthRepository {

    Optional<CompteAuth> findByEmail(String email);
}
