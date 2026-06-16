package fr.jegeremacartenavigo.domain.rag.port;

import java.util.List;

/**
 * Port de vectorisation de texte (embeddings). Implemente en infrastructure par
 * un adapter vers un fournisseur externe (Voyage AI).
 *
 * <p>La distinction document/requete est volontaire : certains modeles attendent
 * un indicateur du type d'entree (input_type) pour de meilleurs resultats.
 */
public interface EmbeddingPort {

    /**
     * Vectorise des passages de documents (pour l'ingestion).
     *
     * @param textes textes a vectoriser (l'ordre est preserve dans le resultat)
     * @return un vecteur par texte, meme cardinalite et meme ordre que l'entree
     */
    List<float[]> vectoriserDocuments(List<String> textes);

    /**
     * Vectorise une requete utilisateur (pour la recherche).
     *
     * @param texte question de l'utilisateur
     * @return le vecteur correspondant
     */
    float[] vectoriserRequete(String texte);
}
