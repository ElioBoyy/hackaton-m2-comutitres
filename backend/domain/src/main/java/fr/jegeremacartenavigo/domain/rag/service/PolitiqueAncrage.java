package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Passage;

import java.util.List;

/**
 * Decide si une question est "ancree" dans le corpus, c'est-a-dire si les
 * passages retrouves sont assez pertinents pour repondre sans inventer.
 *
 * <p>Coeur du garde-fou anti-hallucination : si trop peu de passages depassent
 * le seuil de similarite, on refuse de repondre (question hors corpus).
 */
public final class PolitiqueAncrage {

    private final double seuilSimilarite;
    private final int minFragmentsPertinents;

    /**
     * @param seuilSimilarite        similarite cosinus minimale d'un passage pour
     *                               etre juge pertinent (typiquement ~0.4-0.5)
     * @param minFragmentsPertinents nombre minimal de passages pertinents requis
     *                               pour repondre (>= 1)
     */
    public PolitiqueAncrage(double seuilSimilarite, int minFragmentsPertinents) {
        if (minFragmentsPertinents < 1) {
            throw new IllegalArgumentException("minFragmentsPertinents doit etre >= 1");
        }
        this.seuilSimilarite = seuilSimilarite;
        this.minFragmentsPertinents = minFragmentsPertinents;
    }

    /** Passages dont la similarite atteint le seuil, ordre d'entree preserve. */
    public List<Passage> pertinents(List<Passage> passages) {
        if (passages == null) {
            return List.of();
        }
        return passages.stream()
                .filter(p -> p.score() >= seuilSimilarite)
                .toList();
    }

    /** Vrai si assez de passages pertinents pour repondre sans halluciner. */
    public boolean estAncre(List<Passage> passages) {
        return pertinents(passages).size() >= minFragmentsPertinents;
    }

    public double seuilSimilarite() {
        return seuilSimilarite;
    }
}
