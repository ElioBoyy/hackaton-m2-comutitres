package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.sav.model.Reclamation;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class RepondreReclamationHandler implements CommandHandler<RepondreReclamationCommand, ReclamationDetailResponse> {

    private final ReclamationRepository repository;

    public RepondreReclamationHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationDetailResponse handle(RepondreReclamationCommand command) {
        Reclamation reclamation = repository.ajouterMessage(
                command.idReclamation(),
                command.contenu(),
                command.parAgent(),
                command.idAuteur()
        );
        return ReclamationDetailResponse.from(reclamation);
    }
}
