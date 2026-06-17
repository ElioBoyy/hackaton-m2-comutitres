package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Query;

public record GetDossierCountsQuery() implements Query<DossierCountsResponse> {}
