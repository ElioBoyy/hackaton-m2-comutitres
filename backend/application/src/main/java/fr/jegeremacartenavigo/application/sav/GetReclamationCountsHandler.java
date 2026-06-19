package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class GetReclamationCountsHandler implements QueryHandler<GetReclamationCountsQuery, ReclamationCountsResponse> {

    private final ReclamationRepository repository;

    public GetReclamationCountsHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationCountsResponse handle(GetReclamationCountsQuery query) {
        return ReclamationCountsResponse.from(repository.countByGroupe(query.nomClient(), query.reference()));
    }
}
