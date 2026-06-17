package fr.jegeremacartenavigo.application.rag.ingestion;

import fr.jegeremacartenavigo.application.cqrs.Response;

/**
 * Bilan d'une ingestion.
 *
 * @param documentsTraites  documents (re)vectorises
 * @param documentsIgnores  documents inchanges, donc sautes
 * @param fragmentsCrees    fragments produits pour les documents traites
 * @param totalDocuments    nombre total de documents en base apres ingestion
 * @param totalFragments    nombre total de fragments en base apres ingestion
 */
public record IngestionResultat(
        int documentsTraites,
        int documentsIgnores,
        int fragmentsCrees,
        long totalDocuments,
        long totalFragments
) implements Response {
}
