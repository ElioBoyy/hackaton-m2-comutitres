package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.PieceJustificativeResume;

import java.time.LocalDateTime;

/**
 * @param cheminFichier cle MinIO de l'objet, a passer a GET /fichiers/contenu
 *                      pour ouvrir la piece dans la visionneuse backoffice.
 */
public record PieceJustificativeResponse(
        Integer id,
        String libelleTypePiece,
        String cheminFichier,
        String statutValidation,
        LocalDateTime dateDepot,
        String motifRejet
) implements Response {
    public static PieceJustificativeResponse from(PieceJustificativeResume p) {
        return new PieceJustificativeResponse(
                p.id(), p.libelleTypePiece(), p.cheminFichier(), p.statutValidation(),
                p.dateDepot(), p.motifRejet());
    }
}
