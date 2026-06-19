package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.sav.model.NouvelleReclamation;
import fr.jegeremacartenavigo.domain.sav.model.Reclamation;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class CreerReclamationHandler implements CommandHandler<CreerReclamationCommand, ReclamationDetailResponse> {

    private final ReclamationRepository repository;

    public CreerReclamationHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationDetailResponse handle(CreerReclamationCommand command) {
        Reclamation reclamation = repository.creer(new NouvelleReclamation(
                command.idUtilisateur(),
                command.codeCategorie(),
                command.objet(),
                command.description()
        ));
        return ReclamationDetailResponse.from(reclamation);
    }
}
