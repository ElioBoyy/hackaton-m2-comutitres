package fr.jegeremacartenavigo.infrastructure.adapter.in.web.sav;

/** Corps de POST /reclamations (ouverture cote client). */
public record CreerReclamationRequest(
        String codeCategorie,
        String objet,
        String description
) {
}
