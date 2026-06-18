package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class GetDossiersHandler implements QueryHandler<GetDossiersQuery, DossierListResponse> {

    private final DossierRepository repository;

    public GetDossiersHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public DossierListResponse handle(GetDossiersQuery query) {
        var page = repository.findPage(query.statut(), query.nomClient(), query.numeroDossier(), query.page(), query.pageSize());
        return DossierListResponse.from(page);
    }
}
