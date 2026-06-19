package fr.jegeremacartenavigo.domain.identite.port;

import fr.jegeremacartenavigo.domain.identite.model.EtatVerificationTelephone;

import java.util.Optional;

/**
 * Port secondaire : persistance de l'etat de verification du telephone.
 * Implementation JPA dans la couche infrastructure.
 */
public interface VerificationTelephoneRepository {

    Optional<EtatVerificationTelephone> charger(Integer utilisateurId);

    /** Memorise l'identifiant du PIN envoye pour cet utilisateur. */
    void enregistrerPinId(Integer utilisateurId, String pinId);

    /** Marque le telephone comme verifie et oublie le PIN courant. */
    void marquerVerifie(Integer utilisateurId);
}
