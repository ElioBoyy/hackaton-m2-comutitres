package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class ChangerStatutDossierHandler
        implements CommandHandler<ChangerStatutDossierCommand, DossierDetailResponse> {

    private final DossierRepository repository;

    public ChangerStatutDossierHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public DossierDetailResponse handle(ChangerStatutDossierCommand command) {
        repository.changerStatut(command.idDossier(), command.codeStatut(), command.idAgent());
        return repository.findDetailById(command.idDossier())
                .map(DossierDetailResponse::from)
                .orElseThrow(() -> new DossierIntrouvableException(command.idDossier()));
    }
}

