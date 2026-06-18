package fr.jegeremacartenavigo.application.referentiel;

import fr.jegeremacartenavigo.application.cqrs.Query;

public record GetTypesAbonnementsQuery() implements Query<TypeAbonnementsListResponse> {}
