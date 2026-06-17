package fr.jegeremacartenavigo.domain.rag.port;

import fr.jegeremacartenavigo.domain.rag.model.DocumentCorpus;
import fr.jegeremacartenavigo.domain.rag.model.Fragment;
import fr.jegeremacartenavigo.domain.rag.model.Passage;

import java.util.List;

/**
 * Port de stockage et de recherche des vecteurs (base pgvector). Implemente en
 * infrastructure.
 */
public interface MagasinVecteurs {

    /**
     * Indique si un document est deja present avec ce checksum (donc inutile a
     * re-ingerer). Permet une ingestion idempotente.
     */
    boolean estInchange(String cheminSource, String checksum);

    /**
     * Enregistre (ou remplace) un document et ses fragments vectorises. Si un
     * document de meme {@code cheminSource} existe, il est remplace (ses anciens
     * fragments sont supprimes).
     *
     * @param document   document source
     * @param checksum   checksum du contenu (pour l'idempotence)
     * @param fragments  fragments decoupes
     * @param embeddings vecteurs, dans le meme ordre que {@code fragments}
     *                   (meme cardinalite)
     */
    void enregistrer(DocumentCorpus document, String checksum,
                     List<Fragment> fragments, List<float[]> embeddings);

    /**
     * Recherche les {@code k} fragments les plus proches de la requete, par
     * similarite cosinus decroissante.
     */
    List<Passage> rechercher(float[] embeddingRequete, int k);

    /** Nombre de documents ingeres. */
    long compterDocuments();

    /** Nombre de fragments vectorises. */
    long compterFragments();
}
