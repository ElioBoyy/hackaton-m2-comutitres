package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class SupprimerBrouillonHandler implements CommandHandler<SupprimerBrouillonCommand, StatutMisAJourResponse> {

    private final DossierRepository repository;

    public SupprimerBrouillonHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public StatutMisAJourResponse handle(SupprimerBrouillonCommand command) {
        repository.findDetailById(command.idDossier())
                .orElseThrow(() -> new DossierIntrouvableException(command.idDossier()));
        repository.supprimer(command.idDossier());
        return new StatutMisAJourResponse(command.idDossier(), "SUPPRIME");
    }
}
