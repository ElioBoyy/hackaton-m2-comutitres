package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.sav.model.Reclamation;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class ChangerStatutReclamationHandler implements CommandHandler<ChangerStatutReclamationCommand, ReclamationDetailResponse> {

    private final ReclamationRepository repository;

    public ChangerStatutReclamationHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationDetailResponse handle(ChangerStatutReclamationCommand command) {
        Reclamation reclamation = repository.changerStatut(
                command.idReclamation(),
                command.statut(),
                command.idAgent()
        );
        return ReclamationDetailResponse.from(reclamation);
    }
}
