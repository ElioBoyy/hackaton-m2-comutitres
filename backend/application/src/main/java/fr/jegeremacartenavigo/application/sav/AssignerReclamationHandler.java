package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.sav.model.Reclamation;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class AssignerReclamationHandler implements CommandHandler<AssignerReclamationCommand, ReclamationDetailResponse> {

    private final ReclamationRepository repository;

    public AssignerReclamationHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationDetailResponse handle(AssignerReclamationCommand command) {
        Reclamation reclamation = repository.assigner(command.idReclamation(), command.idAgent());
        return ReclamationDetailResponse.from(reclamation);
    }
}
