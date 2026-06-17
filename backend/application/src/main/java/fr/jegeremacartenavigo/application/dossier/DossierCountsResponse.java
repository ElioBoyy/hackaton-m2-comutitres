package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;

public record DossierCountsResponse(
        long tous,
        long enCours,
        long abouti,
        long rejete,
        long clos
) implements Response {}
