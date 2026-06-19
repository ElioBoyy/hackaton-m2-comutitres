package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class GetReclamationsHandler implements QueryHandler<GetReclamationsQuery, ReclamationListResponse> {

    private final ReclamationRepository repository;

    public GetReclamationsHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationListResponse handle(GetReclamationsQuery query) {
        var page = repository.findPage(query.groupeStatut(), query.nomClient(), query.reference(), query.page(), query.pageSize());
        return ReclamationListResponse.from(page);
    }
}
