package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import fr.jegeremacartenavigo.domain.dossier.model.PieceADeposer;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record EnregistrerPiecesCommand(
        @NotNull Integer idDossier,
        List<PieceADeposer> pieces
) implements Command<StatutMisAJourResponse> {}
