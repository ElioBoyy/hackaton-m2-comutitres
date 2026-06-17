package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Passage;

import java.util.List;

/**
 * Pipeline anti-hors-sujet (1er garde-fou). Decide si une question est dans le
 * perimetre du corpus Navigo : si meme le meilleur passage retrouve est trop
 * eloigne semantiquement, la question est consideree hors sujet et on refuse
 * tout de suite (avant meme de parler d'ancrage / d'appeler le LLM).
 *
 * <p>Distinct de {@link PolitiqueAncrage} (anti-hallucination) : le hors-sujet
 * vise les questions qui ne relevent pas du domaine (meteo, cuisine...), avec un
 * seuil plus bas ; l'ancrage vise les questions du domaine mais insuffisamment
 * couvertes par le corpus.
 */
public final class FiltreHorsSujet {

    private final double seuilHorsSujet;

    /**
     * @param seuilHorsSujet similarite cosinus minimale du meilleur passage pour
     *                       que la question soit jugee "dans le perimetre"
     */
    public FiltreHorsSujet(double seuilHorsSujet) {
        this.seuilHorsSujet = seuilHorsSujet;
    }

    /** Vrai si la question est hors du perimetre du corpus. */
    public boolean horsSujet(List<Passage> passages) {
        if (passages == null || passages.isEmpty()) {
            return true;
        }
        double meilleur = passages.stream().mapToDouble(Passage::score).max().orElse(0);
        return meilleur < seuilHorsSujet;
    }

    public double seuilHorsSujet() {
        return seuilHorsSujet;
    }
}
