package fr.jegeremacartenavigo.domain.identite.model;

/**
 * Etat de verification du telephone d'un utilisateur, tel que stocke.
 *
 * @param utilisateurId identifiant de l'utilisateur
 * @param telephone     numero saisi a l'inscription (peut etre null)
 * @param verifie       vrai si le numero a deja ete verifie
 * @param pinId         identifiant du dernier PIN envoye (null si aucun envoi)
 */
public record EtatVerificationTelephone(
        Integer utilisateurId,
        String telephone,
        boolean verifie,
        String pinId
) {
}
