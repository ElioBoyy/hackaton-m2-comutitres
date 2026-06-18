package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.model.ValidationPiece;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class ValiderPieceHandler implements CommandHandler<ValiderPieceCommand, PieceJustificativeResponse> {

    private final DossierRepository repository;

    public ValiderPieceHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public PieceJustificativeResponse handle(ValiderPieceCommand command) {
        ValidationPiece validation = new ValidationPiece(
                command.idDossier(),
                command.idPiece(),
                command.idAgent(),
                command.valider(),
                command.motifRejet()
        );
        repository.validerOuRejeterPiece(validation);
        return repository.findDetailById(command.idDossier())
                .flatMap(d -> d.pieces().stream()
                        .filter(p -> p.id().equals(command.idPiece()))
                        .findFirst())
                .map(PieceJustificativeResponse::from)
                .orElseThrow();
    }
}
