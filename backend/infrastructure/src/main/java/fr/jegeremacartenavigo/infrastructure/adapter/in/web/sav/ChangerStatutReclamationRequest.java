package fr.jegeremacartenavigo.infrastructure.adapter.in.web.sav;

import fr.jegeremacartenavigo.domain.sav.model.StatutReclamation;

/**
 * Corps de PATCH /reclamations/{id}/statut. {@code statut} est deserialise par
 * son nom (ex. {@code "en_cours"}, {@code "resolu"}).
 */
public record ChangerStatutReclamationRequest(
        StatutReclamation statut
) {
}
