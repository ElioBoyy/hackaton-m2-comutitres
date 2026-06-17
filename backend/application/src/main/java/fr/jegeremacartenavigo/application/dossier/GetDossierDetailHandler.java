package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class GetDossierDetailHandler implements QueryHandler<GetDossierDetailQuery, DossierDetailResponse> {

    private final DossierRepository repository;

    public GetDossierDetailHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public DossierDetailResponse handle(GetDossierDetailQuery query) {
        return repository.findDetailById(query.id())
                .map(DossierDetailResponse::from)
                .orElseThrow(() -> new DossierIntrouvableException(query.id()));
    }
}
