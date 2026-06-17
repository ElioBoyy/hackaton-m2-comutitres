package fr.jegeremacartenavigo.domain.rag.model;

/**
 * Un fragment retrouve par la recherche vectorielle, avec son score de
 * pertinence.
 *
 * @param cheminSource  document d'origine du fragment
 * @param titre         titre du document d'origine
 * @param url           URL d'origine si connue, sinon null
 * @param titreSection  section du document d'ou provient le fragment, sinon null
 * @param contenu       texte du fragment
 * @param score         similarite cosinus avec la requete, dans [-1, 1]
 *                      (1 = identique). Plus c'est haut, plus c'est pertinent.
 */
public record Passage(
        String cheminSource,
        String titre,
        String url,
        String titreSection,
        String contenu,
        double score
) {
}
