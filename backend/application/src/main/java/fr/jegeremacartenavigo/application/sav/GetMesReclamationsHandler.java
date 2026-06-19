package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class GetMesReclamationsHandler implements QueryHandler<GetMesReclamationsQuery, ReclamationListResponse> {

    private final ReclamationRepository repository;

    public GetMesReclamationsHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationListResponse handle(GetMesReclamationsQuery query) {
        return ReclamationListResponse.of(repository.findByUtilisateur(query.idUtilisateur()));
    }
}
