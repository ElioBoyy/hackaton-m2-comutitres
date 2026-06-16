package fr.jegeremacartenavigo.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration du RAG (prefixe {@code rag.*} dans application.yml). Les cles API
 * proviennent de l'environnement (backend/.env en dev).
 */
@ConfigurationProperties(prefix = "rag")
public record RagProperties(
        boolean ingestionAuDemarrage,
        Corpus corpus,
        Voyage voyage,
        Mistral mistral,
        Retrieval retrieval,
        Decoupe decoupe
) {

    /** @param location emplacement du corpus (ex: classpath:rag-corpus/ ou file:...). */
    public record Corpus(String location) {
    }

    /**
     * @param apiKey         cle Voyage (prefixe pa-...) ; vide => embeddings indisponibles
     * @param baseUrl        base de l'API Voyage
     * @param embeddingModel modele d'embedding (ex: voyage-3.5)
     * @param dimensions     dimension des vecteurs (doit correspondre a la colonne vector(n))
     * @param batchSize      taille max d'un lot d'embeddings
     */
    public record Voyage(String apiKey, String baseUrl, String embeddingModel,
                         int dimensions, int batchSize) {
    }

    /**
     * @param apiKey      cle Mistral ; vide => generation indisponible (erreur claire a l'appel)
     * @param baseUrl     base de l'API Mistral
     * @param model       modele de generation (ex: mistral-small-latest)
     * @param temperature temperature de generation
     * @param maxTokens   plafond de tokens generes
     */
    public record Mistral(String apiKey, String baseUrl, String model,
                          double temperature, Integer maxTokens) {
    }

    /**
     * @param topK                   nombre de fragments candidats remontes
     * @param seuilHorsSujet         similarite min du meilleur passage (pipeline anti-hors-sujet)
     * @param seuilSimilarite        similarite min d'un passage pertinent (pipeline anti-hallucination)
     * @param minFragmentsPertinents nombre minimal de fragments pertinents pour repondre
     */
    public record Retrieval(int topK, double seuilHorsSujet, double seuilSimilarite,
                            int minFragmentsPertinents) {
    }

    /**
     * @param tailleCible   taille cible d'un fragment (caracteres)
     * @param chevauchement chevauchement entre fragments (caracteres)
     */
    public record Decoupe(int tailleCible, int chevauchement) {
    }
}
