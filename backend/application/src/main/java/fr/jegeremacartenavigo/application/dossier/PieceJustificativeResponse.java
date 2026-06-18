package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.PieceJustificativeResume;

import java.time.LocalDateTime;

public record PieceJustificativeResponse(
        Integer id,
        String libelleTypePiece,
        String statutValidation,
        LocalDateTime dateDepot,
        String motifRejet
) implements Response {
    public static PieceJustificativeResponse from(PieceJustificativeResume p) {
        return new PieceJustificativeResponse(
                p.id(), p.libelleTypePiece(), p.statutValidation(), p.dateDepot(), p.motifRejet());
    }
}
