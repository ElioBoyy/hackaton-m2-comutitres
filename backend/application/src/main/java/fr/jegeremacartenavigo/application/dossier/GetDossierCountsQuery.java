package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Query;

public record GetDossierCountsQuery(String nomClient, String numeroDossier) implements Query<DossierCountsResponse> {}
