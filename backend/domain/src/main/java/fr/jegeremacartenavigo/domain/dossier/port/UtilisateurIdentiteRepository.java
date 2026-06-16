package fr.jegeremacartenavigo.domain.dossier.port;

import fr.jegeremacartenavigo.domain.dossier.model.UtilisateurIdentite;

import java.util.Optional;

/**
 * Port secondaire : identite minimale d'un utilisateur (nom/prenom), pour
 * l'en-tete du dashboard. Implementation JPA dans la couche infrastructure.
 */
public interface UtilisateurIdentiteRepository {

    Optional<UtilisateurIdentite> findById(Integer idUtilisateur);
}
