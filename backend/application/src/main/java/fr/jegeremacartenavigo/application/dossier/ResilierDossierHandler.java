package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class ResilierDossierHandler implements CommandHandler<ResilierDossierCommand, StatutMisAJourResponse> {

    private final DossierRepository repository;

    public ResilierDossierHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public StatutMisAJourResponse handle(ResilierDossierCommand command) {
        repository.findDetailById(command.idDossier())
                .orElseThrow(() -> new DossierIntrouvableException(command.idDossier()));
        repository.resilier(command.idDossier());
        return new StatutMisAJourResponse(command.idDossier(), "RESILIE");
    }
}
