package fr.jegeremacartenavigo.domain.dossier.model;

import java.time.LocalDateTime;

/**
 * @param codeTypePiece    code metier stable (ex: "PIECE_IDENTITE"). Permet le
 *                         filtrage cote front (selecteur d'ajout) sans dependre
 *                         du libelle qui peut etre accentué/normalise differemment.
 * @param cheminFichier    cle MinIO (ou null si pas encore deposee) permettant au
 *                         backoffice d'ouvrir la piece via GET /fichiers/contenu
 *                         (proxy auth-gated, cf. FichierController).
 * @param modifieParAgent  true quand un agent a depose ou remplace ce fichier
 *                         depuis le backoffice ; affiche cote client comme
 *                         "modifiee par un agent" (sans divulguer son identite).
 */
public record PieceJustificativeResume(
        Integer id,
        String codeTypePiece,
        String libelleTypePiece,
        String cheminFichier,
        String statutValidation,
        LocalDateTime dateDepot,
        String motifRejet,
        boolean modifieParAgent,
        boolean verifieParIA
) {
}
