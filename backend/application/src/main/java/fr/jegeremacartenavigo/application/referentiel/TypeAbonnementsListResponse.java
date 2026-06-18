package fr.jegeremacartenavigo.application.referentiel;

import fr.jegeremacartenavigo.application.cqrs.Response;

import java.util.List;

public record TypeAbonnementsListResponse(List<TypeAbonnementResponse> abonnements) implements Response {}
