package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

import java.util.List;

public class SoumettreEnVerificationHandler implements CommandHandler<SoumettreEnVerificationCommand, StatutMisAJourResponse> {

    private final DossierRepository repository;

    public SoumettreEnVerificationHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public StatutMisAJourResponse handle(SoumettreEnVerificationCommand command) {
        repository.findDetailById(command.idDossier())
                .orElseThrow(() -> new DossierIntrouvableException(command.idDossier()));
        if (command.pieces() != null && !command.pieces().isEmpty()) {
            repository.ajouterOuRemplacerPieces(command.idDossier(), command.pieces());
        }
        repository.soumettre(command.idDossier());
        return new StatutMisAJourResponse(command.idDossier(), "EN_VERIFICATION");
    }
}
