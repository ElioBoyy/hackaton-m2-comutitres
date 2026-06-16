package fr.jegeremacartenavigo.domain.auth.port;

import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;

import java.util.Optional;

/**
 * Port secondaire : acces persistant aux utilisateurs pour l'authentification.
 * Implementation dans la couche infrastructure (adapter JPA).
 */
public interface UtilisateurAuthRepository {

    Optional<UtilisateurAuth> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Persiste un nouvel utilisateur et retourne l'instance avec son id. */
    UtilisateurAuth save(UtilisateurAuth utilisateur);

    Optional<UtilisateurAuth> findById(Integer id);
}
