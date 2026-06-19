package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.sav.model.GroupeStatutReclamation;

import java.util.Map;

/**
 * Compteurs de la file backoffice par groupe de statut. {@code tous} = somme.
 */
public record ReclamationCountsResponse(
        long tous,
        long ouvert,
        long enCours,
        long resolu,
        long ferme
) implements Response {

    public static ReclamationCountsResponse from(Map<String, Long> parGroupe) {
        long ouvert = parGroupe.getOrDefault(GroupeStatutReclamation.ouvert.name(), 0L);
        long enCours = parGroupe.getOrDefault(GroupeStatutReclamation.en_cours.name(), 0L);
        long resolu = parGroupe.getOrDefault(GroupeStatutReclamation.resolu.name(), 0L);
        long ferme = parGroupe.getOrDefault(GroupeStatutReclamation.ferme.name(), 0L);
        return new ReclamationCountsResponse(ouvert + enCours + resolu + ferme, ouvert, enCours, resolu, ferme);
    }
}
