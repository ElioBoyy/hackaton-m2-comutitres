package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class AjouterPieceHandler implements CommandHandler<AjouterPieceCommand, PieceJustificativeResponse> {

    private final DossierRepository repository;

    public AjouterPieceHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public PieceJustificativeResponse handle(AjouterPieceCommand command) {
        return PieceJustificativeResponse.from(repository.ajouterPiece(
                command.idDossier(),
                command.idAuteur(),
                command.codeTypePiece(),
                command.cheminFichier(),
                command.parAgent()
        ));
    }
}
