package fr.jegeremacartenavigo.domain.rag.model;

/**
 * Un document source du corpus, tel que lu depuis sa source (fichier markdown).
 *
 * @param cheminSource identifiant stable du document (chemin relatif), unique
 * @param titre        titre lisible (extrait du markdown ou du nom de fichier)
 * @param url          URL d'origine si connue (pour les citations), sinon null
 * @param categorie    rubrique du corpus (ex: "idfm/faq"), sinon null
 * @param contenu      contenu brut (markdown) du document
 */
public record DocumentCorpus(
        String cheminSource,
        String titre,
        String url,
        String categorie,
        String contenu
) {
}
