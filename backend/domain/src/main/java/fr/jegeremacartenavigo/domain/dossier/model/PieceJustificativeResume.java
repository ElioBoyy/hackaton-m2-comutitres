package fr.jegeremacartenavigo.domain.dossier.model;

import java.time.LocalDateTime;

public record PieceJustificativeResume(
        Integer id,
        String libelleTypePiece,
        String statutValidation,
        LocalDateTime dateDepot,
        String motifRejet
) {
}
