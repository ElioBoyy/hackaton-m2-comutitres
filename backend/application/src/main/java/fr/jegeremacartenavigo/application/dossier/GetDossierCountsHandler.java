package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.QueryHandler;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

import java.util.Map;

public class GetDossierCountsHandler implements QueryHandler<GetDossierCountsQuery, DossierCountsResponse> {

    private final DossierRepository dossierRepository;

    public GetDossierCountsHandler(DossierRepository dossierRepository) {
        this.dossierRepository = dossierRepository;
    }

    @Override
    public DossierCountsResponse handle(GetDossierCountsQuery query) {
        Map<String, Long> counts = dossierRepository.countByCategorie(query.nomClient(), query.numeroDossier());
        long enCours = counts.getOrDefault("en_cours", 0L);
        long abouti  = counts.getOrDefault("abouti",   0L);
        long rejete  = counts.getOrDefault("rejete",   0L);
        long clos    = counts.getOrDefault("clos",     0L);
        return new DossierCountsResponse(enCours + abouti + rejete + clos, enCours, abouti, rejete, clos);
    }
}
