package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class ActiverDossierHandler implements CommandHandler<ActiverDossierCommand, DossierDetailResponse> {

    private final DossierRepository repository;

    public ActiverDossierHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public DossierDetailResponse handle(ActiverDossierCommand command) {
        repository.activerDossier(command.idDossier(), command.idAgent(), command.dateDebutDroits());
        return repository.findDetailById(command.idDossier())
                .map(DossierDetailResponse::from)
                .orElseThrow(() -> new DossierIntrouvableException(command.idDossier()));
    }
}
