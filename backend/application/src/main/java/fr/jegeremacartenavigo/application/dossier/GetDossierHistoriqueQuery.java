package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Query;

public record GetDossierHistoriqueQuery(Integer idDossier) implements Query<HistoriqueEntreeResponse.ListResponse> {}
