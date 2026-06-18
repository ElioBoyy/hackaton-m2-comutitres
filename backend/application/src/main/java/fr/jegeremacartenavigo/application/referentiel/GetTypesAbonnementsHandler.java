package fr.jegeremacartenavigo.application.referentiel;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.referentiel.port.TypeAbonnementRepository;

public class GetTypesAbonnementsHandler implements QueryHandler<GetTypesAbonnementsQuery, TypeAbonnementsListResponse> {

    private final TypeAbonnementRepository repository;

    public GetTypesAbonnementsHandler(TypeAbonnementRepository repository) {
        this.repository = repository;
    }

    @Override
    public TypeAbonnementsListResponse handle(GetTypesAbonnementsQuery query) {
        var list = repository.findAllActifs().stream()
                .map(t -> new TypeAbonnementResponse(
                        t.code(),
                        t.libelle(),
                        t.categorie(),
                        t.periodicite(),
                        t.tarifPlein(),
                        t.description(),
                        t.transports(),
                        t.zones()
                ))
                .toList();
        return new TypeAbonnementsListResponse(list);
    }
}
