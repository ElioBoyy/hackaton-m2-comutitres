package fr.jegeremacartenavigo.domain.dossier.model;

import java.time.LocalDateTime;

/**
 * @param cheminFichier cle MinIO (ou null si pas encore deposee) permettant au
 *                      backoffice d'ouvrir la piece via GET /fichiers/contenu
 *                      (proxy auth-gated, cf. FichierController).
 */
public record PieceJustificativeResume(
        Integer id,
        String libelleTypePiece,
        String cheminFichier,
        String statutValidation,
        LocalDateTime dateDepot,
        String motifRejet
) {
}
