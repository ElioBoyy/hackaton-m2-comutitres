package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.HistoriqueEntree;

import java.time.LocalDateTime;
import java.util.List;

public record HistoriqueEntreeResponse(
        Integer id,
        LocalDateTime dateAction,
        String typeAction,
        String statutAvant,
        String statutApres,
        String nomAuteur,
        String description
) implements Response {

    public static HistoriqueEntreeResponse from(HistoriqueEntree e) {
        return new HistoriqueEntreeResponse(
                e.id(), e.dateAction(), e.typeAction(),
                e.statutAvant(), e.statutApres(), e.nomAuteur(), e.description());
    }

    public record ListResponse(List<HistoriqueEntreeResponse> historique) implements Response {}
}
