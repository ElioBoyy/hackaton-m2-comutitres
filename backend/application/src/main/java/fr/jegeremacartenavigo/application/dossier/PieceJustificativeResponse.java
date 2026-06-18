package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.PieceJustificativeResume;

import java.time.LocalDateTime;

/**
 * @param cheminFichier    cle MinIO de l'objet, a passer a GET /fichiers/contenu
 *                         pour ouvrir la piece dans la visionneuse backoffice.
 * @param modifieParAgent  true quand un agent a depose ou remplace ce fichier
 *                         depuis le backoffice (affichage cote client).
 */
public record PieceJustificativeResponse(
        Integer id,
        String codeTypePiece,
        String libelleTypePiece,
        String cheminFichier,
        String statutValidation,
        LocalDateTime dateDepot,
        String motifRejet,
        boolean modifieParAgent
) implements Response {
    public static PieceJustificativeResponse from(PieceJustificativeResume p) {
        return new PieceJustificativeResponse(
                p.id(), p.codeTypePiece(), p.libelleTypePiece(), p.cheminFichier(),
                p.statutValidation(), p.dateDepot(), p.motifRejet(), p.modifieParAgent());
    }
}
