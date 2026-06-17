package fr.jegeremacartenavigo.domain.auth.port;

import fr.jegeremacartenavigo.domain.auth.model.AgentAuth;

import java.util.Optional;

/**
 * Port secondaire : acces persistant aux agents pour l'authentification.
 * Implementation dans la couche infrastructure (adapter JPA).
 */
public interface AgentAuthRepository {

    Optional<AgentAuth> findByEmail(String email);

    Optional<AgentAuth> findById(Integer id);
}
