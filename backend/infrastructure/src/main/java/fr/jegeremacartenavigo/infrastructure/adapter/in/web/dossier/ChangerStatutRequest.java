package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import fr.jegeremacartenavigo.domain.dossier.model.CodeStatutDossier;

/**
 * Corps JSON pour {@code PATCH /dossiers/{id}/statut}. Jackson convertit la
 * string JSON en enum ; un code inconnu (ex: "VALIDIE") declenche un 400
 * automatique avant meme d'entrer dans le controller.
 */
public record ChangerStatutRequest(CodeStatutDossier codeStatut) {
}
