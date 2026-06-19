package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Query;

/** Compteurs de la file backoffice, avec filtre de recherche optionnel. */
public record GetReclamationCountsQuery(
        String nomClient,
        String reference
) implements Query<ReclamationCountsResponse> {
}
