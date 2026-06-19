package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class RemplacerFichierPieceHandler
        implements CommandHandler<RemplacerFichierPieceCommand, PieceJustificativeResponse> {

    private final DossierRepository repository;

    public RemplacerFichierPieceHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public PieceJustificativeResponse handle(RemplacerFichierPieceCommand command) {
        return PieceJustificativeResponse.from(repository.remplacerFichierPiece(
                command.idDossier(),
                command.idPiece(),
                command.idAuteur(),
                command.cheminFichier(),
                command.parAgent()
        ));
    }
}
