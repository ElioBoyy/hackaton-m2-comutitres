package fr.jegeremacartenavigo.domain.rag.model;

import java.util.List;

/**
 * Reponse de l'assistant a une question.
 *
 * <p>Deux cas mutuellement exclusifs :
 * <ul>
 *   <li>{@code horsCorpus == false} : reponse ancree, redigee a partir du corpus,
 *       avec ses {@link Citation citations} et les {@link Passage passages} utilises.</li>
 *   <li>{@code horsCorpus == true} : refus. La question n'est pas couverte par le
 *       corpus ; {@code texte} contient un message de refus et {@code motif} la raison.
 *       Aucune citation. On ne hallucine pas.</li>
 * </ul>
 *
 * @param texte      reponse redigee, ou message de refus
 * @param citations  sources citees (vide si hors corpus)
 * @param passages   fragments retenus comme contexte (vide si hors corpus)
 * @param horsCorpus vrai si la question n'est pas couverte par le corpus
 * @param motif      raison technique du refus (null si reponse ancree)
 */
public record AssistantReponse(
        String texte,
        List<Citation> citations,
        List<Passage> passages,
        boolean horsCorpus,
        String motif
) {

    public AssistantReponse {
        citations = citations == null ? List.of() : List.copyOf(citations);
        passages = passages == null ? List.of() : List.copyOf(passages);
    }

    public static AssistantReponse ancree(String texte, List<Citation> citations, List<Passage> passages) {
        return new AssistantReponse(texte, citations, passages, false, null);
    }

    public static AssistantReponse refus(String texte, String motif) {
        return new AssistantReponse(texte, List.of(), List.of(), true, motif);
    }
}
