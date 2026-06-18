package fr.jegeremacartenavigo.domain.dossier.model;

import java.time.LocalDateTime;

/**
 * Vue domaine resumee d'un dossier, utilisee pour la liste backoffice des
 * dossiers en attente de verification.
 */
public record DossierResume(
        Integer id,
        String numeroDossier,
        String nomTitulaire,
        String codeTypeAbonnement,
        String libelleTypeAbonnement,
        String codeStatut,
        String libelleStatut,
        String categorieStatut,
        long nbPiecesEnAttente,
        LocalDateTime dateCreation
) {
}
