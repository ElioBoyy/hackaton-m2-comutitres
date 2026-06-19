package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.sav.exception.ReclamationIntrouvableException;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;

public class GetReclamationDetailHandler implements QueryHandler<GetReclamationDetailQuery, ReclamationDetailResponse> {

    private final ReclamationRepository repository;

    public GetReclamationDetailHandler(ReclamationRepository repository) {
        this.repository = repository;
    }

    @Override
    public ReclamationDetailResponse handle(GetReclamationDetailQuery query) {
        return repository.findDetail(query.id(), query.idProprietaire())
                .map(ReclamationDetailResponse::from)
                .orElseThrow(() -> new ReclamationIntrouvableException(query.id()));
    }
}
