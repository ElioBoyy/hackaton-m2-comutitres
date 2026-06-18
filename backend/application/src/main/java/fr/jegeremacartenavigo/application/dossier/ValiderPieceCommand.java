package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;

public record ValiderPieceCommand(
        Integer idDossier,
        Integer idPiece,
        Integer idAgent,
        boolean valider,
        String motifRejet
) implements Command<PieceJustificativeResponse> {}
