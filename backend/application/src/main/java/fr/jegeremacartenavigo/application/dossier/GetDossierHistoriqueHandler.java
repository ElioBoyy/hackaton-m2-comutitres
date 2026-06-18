package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class GetDossierHistoriqueHandler
        implements QueryHandler<GetDossierHistoriqueQuery, HistoriqueEntreeResponse.ListResponse> {

    private final DossierRepository repository;

    public GetDossierHistoriqueHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public HistoriqueEntreeResponse.ListResponse handle(GetDossierHistoriqueQuery query) {
        return new HistoriqueEntreeResponse.ListResponse(
                repository.findHistoriqueByDossierId(query.idDossier())
                        .stream()
                        .map(HistoriqueEntreeResponse::from)
                        .toList()
        );
    }
}
