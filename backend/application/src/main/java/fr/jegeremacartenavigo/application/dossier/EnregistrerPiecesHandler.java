package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class EnregistrerPiecesHandler implements CommandHandler<EnregistrerPiecesCommand, StatutMisAJourResponse> {

    private final DossierRepository repository;

    public EnregistrerPiecesHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public StatutMisAJourResponse handle(EnregistrerPiecesCommand command) {
        var dossier = repository.findDetailById(command.idDossier())
                .orElseThrow(() -> new DossierIntrouvableException(command.idDossier()));
        if (command.pieces() != null && !command.pieces().isEmpty()) {
            repository.ajouterOuRemplacerPieces(command.idDossier(), command.pieces());
        }
        return new StatutMisAJourResponse(command.idDossier(), dossier.codeStatut());
    }
}
