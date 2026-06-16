package fr.jegeremacartenavigo.domain.rag.model;

/**
 * Une source citee dans une reponse de l'assistant.
 *
 * @param index        numero d'appel dans la reponse (1-based, ex: [1])
 * @param titre        titre du document source
 * @param url          URL d'origine si connue, sinon null
 * @param cheminSource chemin du document source dans le corpus
 */
public record Citation(
        int index,
        String titre,
        String url,
        String cheminSource
) {
}
