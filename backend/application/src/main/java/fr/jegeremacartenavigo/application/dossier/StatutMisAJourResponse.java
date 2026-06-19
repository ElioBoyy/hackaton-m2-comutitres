package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;

public record StatutMisAJourResponse(Integer idDossier, String codeStatut) implements Response {
}
